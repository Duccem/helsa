-- =====================================================================
-- Esquema de base de datos – MVP SaaS para psicólogos
-- Motor: PostgreSQL 15+
-- Fecha: 2026-10-14
--
-- Autenticación: la gestiona better-auth (tablas "user", "session",
-- "account", "verification"). Este esquema NO las crea; solo referencia
-- "user"(id) de tipo TEXT, que es el tipo por defecto de better-auth.
--   * Psicólogos: un registro en "user" + uno en therapist.
--   * Pacientes con portal: un registro en "user" creado con el plugin
--     magic-link de better-auth y enlazado en patient.user_id.
--
-- Ejecutar DESPUÉS de las migraciones de better-auth.
--
-- Solo estructura: tablas, tipos, claves, restricciones e índices.
-- No hay funciones, triggers, vistas ni datos iniciales; las reglas de
-- negocio (updated_at, notas firmadas inmutables, auditoría de solo
-- inserción, saldos, etc.) viven en el backend.
--
-- Convenciones:
--   * PK uuid con gen_random_uuid() (nativo desde PostgreSQL 13).
--   * Montos en USD como numeric(12,2); bolívares numeric(16,2).
--   * Fechas/horas en timestamptz (UTC); la zona del terapeuta se guarda
--     en therapist.timezone para mostrar y agendar.
--   * Columnas *_enc (bytea): contenido clínico cifrado por la aplicación
--     antes de guardarse (cifrado por cuenta). enc_key_version permite
--     rotar llaves.
--   * updated_at lo asigna el backend en cada actualización.
-- =====================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS btree_gist;  -- evitar citas solapadas    -- slugs y correos sin mayúsculas

-- ---------------------------------------------------------------------
-- Tipos enumerados
-- ---------------------------------------------------------------------
CREATE TYPE payment_method        AS ENUM ('pago_movil', 'zelle', 'binance_usdt', 'transferencia_bs', 'efectivo_usd', 'efectivo_bs', 'tarjeta', 'otro');
CREATE TYPE patient_status        AS ENUM ('prospect', 'active', 'inactive', 'discharged');
CREATE TYPE appointment_status    AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE appointment_modality  AS ENUM ('video', 'in_person', 'phone');
CREATE TYPE booking_source        AS ENUM ('therapist', 'booking_link', 'patient_portal');
CREATE TYPE cancelled_by          AS ENUM ('therapist', 'patient', 'system');
CREATE TYPE reminder_channel      AS ENUM ('whatsapp', 'email');
CREATE TYPE reminder_kind         AS ENUM ('h24', 'h2', 'booking_confirmation', 'cancellation');
CREATE TYPE reminder_status       AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed', 'skipped');
CREATE TYPE reminder_response     AS ENUM ('confirmed', 'cancelled');
CREATE TYPE video_provider        AS ENUM ('livekit', 'daily');
CREATE TYPE participant_role      AS ENUM ('therapist', 'patient');
CREATE TYPE note_template_kind    AS ENUM ('free', 'soap', 'follow_up', 'custom');
CREATE TYPE task_status           AS ENUM ('assigned', 'completed', 'cancelled');
CREATE TYPE task_frequency        AS ENUM ('once', 'daily', 'weekly');
CREATE TYPE audit_action          AS ENUM ('view', 'create', 'update', 'delete', 'export', 'sign');

-- =====================================================================
-- 1. TERAPEUTA
-- =====================================================================

-- Perfil profesional del psicólogo (1:1 con "user" de better-auth).
CREATE TABLE therapist (
  user_id                  text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  display_name             text        NOT NULL,
  professional_title       text,                         -- "Psicólogo clínico", "Lic. en Psicología"
  license_number           text,                         -- número de colegiatura / FPV
  license_body             text,                         -- p. ej. "Colegio de Psicólogos del Estado Miranda"
  license_verified_at      timestamptz,                  -- verificación manual por un admin
  license_verified_by      text REFERENCES "user"(id) ON DELETE SET NULL,
  phone_e164               text,
  country_code             char(2)     NOT NULL DEFAULT 'VE',
  timezone                 text        NOT NULL DEFAULT 'America/Caracas',
  booking_slug             text      UNIQUE,           -- /reservar/<slug>
  booking_enabled          boolean     NOT NULL DEFAULT false,
  default_session_minutes  smallint    NOT NULL DEFAULT 50 CHECK (default_session_minutes BETWEEN 15 AND 240),
  default_buffer_minutes   smallint    NOT NULL DEFAULT 10 CHECK (default_buffer_minutes BETWEEN 0 AND 120),
  default_price_usd        numeric(12,2) CHECK (default_price_usd >= 0),
  booking_notice_hours     smallint    NOT NULL DEFAULT 12 CHECK (booking_notice_hours >= 0),
  reminders_enabled        boolean     NOT NULL DEFAULT true,
  enc_key_version          smallint    NOT NULL DEFAULT 1,  -- llave activa para cifrar sus datos clínicos
  onboarded_at             timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
);

-- Horario semanal disponible para el link de reserva.
CREATE TABLE availability_rule (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id  text     NOT NULL REFERENCES therapist(user_id) ON DELETE CASCADE,
  weekday       smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),  -- 0 = domingo
  start_time    time     NOT NULL,
  end_time      time     NOT NULL,
  modality      appointment_modality,                               -- NULL = cualquiera
  created_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

-- Bloqueos puntuales (vacaciones, feriados, imprevistos).
CREATE TABLE availability_block (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id  text        NOT NULL REFERENCES therapist(user_id) ON DELETE CASCADE,
  starts_at     timestamptz NOT NULL,
  ends_at       timestamptz NOT NULL,
  reason        text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

-- =====================================================================
-- 2. PACIENTES Y ARCHIVOS
-- =====================================================================

CREATE TABLE patient (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id            text        NOT NULL REFERENCES therapist(user_id) ON DELETE CASCADE,
  user_id                 text        UNIQUE REFERENCES "user"(id) ON DELETE SET NULL, -- acceso al portal
  first_name              text        NOT NULL,
  last_name               text        NOT NULL,
  preferred_name          text,
  national_id             text,                    -- cédula (opcional)
  birth_date              date,
  gender                  text,
  email                   texts,
  phone_e164              text,
  whatsapp_opt_in         boolean     NOT NULL DEFAULT false,
  country_code            char(2)     NOT NULL DEFAULT 'VE',
  city                    text,
  timezone                text        NOT NULL DEFAULT 'America/Caracas',
  emergency_contact_name  text,
  emergency_contact_phone text,
  emergency_contact_relation text,
  intake_reason_enc       bytea,                   -- motivo de consulta (cifrado)
  enc_key_version         smallint,
  status                  patient_status NOT NULL DEFAULT 'active',
  session_price_usd       numeric(12,2) CHECK (session_price_usd >= 0), -- NULL = precio por defecto del terapeuta
  portal_enabled          boolean     NOT NULL DEFAULT false,
  first_session_at        timestamptz,
  discharged_at           timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  deleted_at              timestamptz,             -- borrado lógico
  CHECK ((intake_reason_enc IS NULL) = (enc_key_version IS NULL)),
  CHECK (NOT portal_enabled OR email IS NOT NULL OR phone_e164 IS NOT NULL),
  -- Clave compuesta para que las tablas hijas verifiquen que el paciente
  -- pertenece al mismo terapeuta.
  UNIQUE (id, therapist_id)
);

-- Archivos en almacenamiento de objetos (S3 / Supabase Storage).
-- Adjuntos clínicos y firmas de consentimiento.
CREATE TABLE file (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id    text        NOT NULL REFERENCES therapist(user_id) ON DELETE CASCADE,
  patient_id      uuid,
  uploaded_by     text        REFERENCES "user"(id) ON DELETE SET NULL,
  storage_key     text        NOT NULL UNIQUE,
  original_name   text        NOT NULL,
  mime_type       text        NOT NULL,
  size_bytes      integer     NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 10485760), -- 10 MB
  sha256          bytea,
  is_encrypted    boolean     NOT NULL DEFAULT true,
  enc_key_version smallint,
  created_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz,
  FOREIGN KEY (patient_id, therapist_id) REFERENCES patient(id, therapist_id) ON DELETE CASCADE,
  CHECK (NOT is_encrypted OR enc_key_version IS NOT NULL)
);
CREATE INDEX idx_file_patient ON file (patient_id) WHERE deleted_at IS NULL;

-- =====================================================================
-- 3. CONSENTIMIENTO INFORMADO
-- =====================================================================

-- Plantillas versionadas de consentimiento (del sistema o del terapeuta).
CREATE TABLE consent_template (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id  text        REFERENCES therapist(user_id) ON DELETE CASCADE, -- NULL = plantilla del sistema
  title         text        NOT NULL,
  version       integer     NOT NULL DEFAULT 1 CHECK (version > 0),
  body_md       text        NOT NULL,
  is_active     boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_consent_template_version
  ON consent_template (coalesce(therapist_id, '__system__'), title, version);

-- Consentimiento firmado por un paciente: guarda una copia exacta del texto.
CREATE TABLE patient_consent (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id        text        NOT NULL,
  patient_id          uuid        NOT NULL,
  template_id         uuid        REFERENCES consent_template(id) ON DELETE SET NULL,
  body_snapshot_md    text        NOT NULL,
  body_sha256         bytea       NOT NULL,
  sign_token_hash     bytea       UNIQUE,          -- token del link de firma (solo hash)
  sign_token_expires_at timestamptz,
  signed_name         text,
  signed_at           timestamptz,
  signer_ip           inet,
  signer_user_agent   text,
  signature_file_id   uuid        REFERENCES file(id) ON DELETE SET NULL,
  revoked_at          timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (patient_id, therapist_id) REFERENCES patient(id, therapist_id) ON DELETE CASCADE,
  CHECK ((signed_at IS NULL) = (signed_name IS NULL))
);
CREATE INDEX idx_patient_consent_patient ON patient_consent (patient_id, created_at DESC);

-- =====================================================================
-- 4. AGENDA Y CITAS
-- =====================================================================

-- Serie de citas recurrentes (las citas concretas se materializan en appointment).
CREATE TABLE appointment_series (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id    text        NOT NULL,
  patient_id      uuid        NOT NULL,
  rrule           text        NOT NULL,             -- RFC 5545, p. ej. 'FREQ=WEEKLY;BYDAY=TU'
  local_start_time time       NOT NULL,
  duration_minutes smallint   NOT NULL CHECK (duration_minutes BETWEEN 15 AND 240),
  timezone        text        NOT NULL DEFAULT 'America/Caracas',
  modality        appointment_modality NOT NULL DEFAULT 'video',
  starts_on       date        NOT NULL,
  ends_on         date,
  materialized_until date,                          -- hasta dónde se generaron citas
  is_active       boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (patient_id, therapist_id) REFERENCES patient(id, therapist_id) ON DELETE CASCADE,
  CHECK (ends_on IS NULL OR ends_on >= starts_on)
);

CREATE TABLE appointment (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id      text        NOT NULL,
  patient_id        uuid        NOT NULL,
  series_id         uuid        REFERENCES appointment_series(id) ON DELETE SET NULL,
  starts_at         timestamptz NOT NULL,
  ends_at           timestamptz NOT NULL,
  modality          appointment_modality NOT NULL DEFAULT 'video',
  status            appointment_status   NOT NULL DEFAULT 'scheduled',
  booked_via        booking_source       NOT NULL DEFAULT 'therapist',
  price_usd         numeric(12,2) CHECK (price_usd >= 0),  -- precio congelado al agendar
  location          text,                                  -- solo presencial
  confirmed_at      timestamptz,
  cancelled_at      timestamptz,
  cancelled_by      cancelled_by,
  cancel_reason     text,
  completed_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (patient_id, therapist_id) REFERENCES patient(id, therapist_id) ON DELETE CASCADE,
  UNIQUE (id, therapist_id),
  UNIQUE (id, patient_id),
  CHECK (ends_at > starts_at),
  CHECK ((status = 'cancelled') = (cancelled_at IS NOT NULL)),
  -- Un terapeuta no puede tener dos citas activas que se solapen.
  CONSTRAINT no_overlapping_appointments EXCLUDE USING gist (
    therapist_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status NOT IN ('cancelled', 'no_show'))
);
CREATE INDEX idx_appointment_therapist_time ON appointment (therapist_id, starts_at);
CREATE INDEX idx_appointment_patient_time ON appointment (patient_id, starts_at DESC);
CREATE UNIQUE INDEX uq_appointment_series_slot ON appointment (series_id, starts_at) WHERE series_id IS NOT NULL;

-- Recordatorios programados (WhatsApp / correo).
CREATE TABLE appointment_reminder (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id      uuid        NOT NULL REFERENCES appointment(id) ON DELETE CASCADE,
  channel             reminder_channel NOT NULL,
  kind                reminder_kind    NOT NULL,
  scheduled_for       timestamptz NOT NULL,
  status              reminder_status  NOT NULL DEFAULT 'pending',
  provider_message_id text,
  attempts            smallint    NOT NULL DEFAULT 0,
  sent_at             timestamptz,
  error               text,
  response_token_hash bytea       UNIQUE,      -- link "confirmar / cancelar" (solo hash)
  response            reminder_response,
  responded_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (appointment_id, channel, kind),
  CHECK ((response IS NULL) = (responded_at IS NULL))
);
-- Cola del worker que envía recordatorios.
CREATE INDEX idx_reminder_queue ON appointment_reminder (scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_reminder_provider_msg ON appointment_reminder (provider_message_id) WHERE provider_message_id IS NOT NULL;

-- =====================================================================
-- 5. VIDEOCONSULTA
-- =====================================================================

CREATE TABLE video_room (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id        uuid        NOT NULL UNIQUE REFERENCES appointment(id) ON DELETE CASCADE,
  provider              video_provider NOT NULL DEFAULT 'livekit',
  room_name             text        NOT NULL UNIQUE,
  patient_join_token_hash bytea     UNIQUE,     -- link de entrada sin login (solo hash)
  opens_at              timestamptz NOT NULL,   -- p. ej. 10 min antes
  closes_at             timestamptz NOT NULL,
  started_at            timestamptz,            -- entra el segundo participante
  ended_at              timestamptz,
  duration_seconds      integer     CHECK (duration_seconds >= 0),
  audio_only_seconds    integer     NOT NULL DEFAULT 0 CHECK (audio_only_seconds >= 0),
  reconnect_count       integer     NOT NULL DEFAULT 0 CHECK (reconnect_count >= 0),
  billed_participant_minutes numeric(10,2) NOT NULL DEFAULT 0, -- para medir costo
  created_at            timestamptz NOT NULL DEFAULT now(),
  CHECK (closes_at > opens_at),
  CHECK (ended_at IS NULL OR started_at IS NULL OR ended_at >= started_at)
);
CREATE INDEX idx_video_room_started ON video_room (started_at);

-- Eventos por participante (entrada, salida, caída, cambio a audio).
CREATE TABLE video_participant_event (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id         uuid        NOT NULL REFERENCES video_room(id) ON DELETE CASCADE,
  role            participant_role NOT NULL,
  event_type      text        NOT NULL CHECK (event_type IN ('joined', 'left', 'reconnecting', 'reconnected', 'audio_only_on', 'audio_only_off', 'quality_sample')),
  occurred_at     timestamptz NOT NULL DEFAULT now(),
  bitrate_kbps    integer     CHECK (bitrate_kbps >= 0),
  packet_loss_pct numeric(5,2) CHECK (packet_loss_pct BETWEEN 0 AND 100),
  client_info     jsonb                       -- navegador, SO, tipo de red
);
CREATE INDEX idx_video_event_room ON video_participant_event (room_id, occurred_at);

-- =====================================================================
-- 6. NOTAS CLÍNICAS
-- =====================================================================

CREATE TABLE note_template (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id  text        REFERENCES therapist(user_id) ON DELETE CASCADE, -- NULL = del sistema
  kind          note_template_kind NOT NULL,
  name          text        NOT NULL,
  structure     jsonb       NOT NULL,        -- secciones: [{key, label, type, placeholder}]
  is_active     boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_note_template_name ON note_template (coalesce(therapist_id, '__system__'), name);

-- Nota de sesión. El cuerpo va cifrado; la app lo descifra al leer.
-- client_id + version soportan la escritura sin conexión (offline-first).
CREATE TABLE session_note (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id      text        NOT NULL,
  patient_id        uuid        NOT NULL,
  appointment_id    uuid,
  template_id       uuid        REFERENCES note_template(id) ON DELETE SET NULL,
  title             text,
  content_enc       bytea       NOT NULL,
  enc_key_version   smallint    NOT NULL,
  client_id         uuid        NOT NULL,      -- id generado en el dispositivo
  version           integer     NOT NULL DEFAULT 1 CHECK (version > 0),
  client_updated_at timestamptz NOT NULL,      -- hora del dispositivo al editar
  signed_at         timestamptz,               -- nota cerrada: el backend impide editarla
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz,
  FOREIGN KEY (patient_id, therapist_id) REFERENCES patient(id, therapist_id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id, patient_id) REFERENCES appointment(id, patient_id) ON DELETE SET NULL (appointment_id),
  UNIQUE (therapist_id, client_id)
);
CREATE INDEX idx_session_note_patient ON session_note (patient_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_session_note_sync ON session_note (therapist_id, updated_at);

-- Adjuntos de una nota (relación N:M con file).
CREATE TABLE session_note_file (
  note_id   uuid NOT NULL REFERENCES session_note(id) ON DELETE CASCADE,
  file_id   uuid NOT NULL REFERENCES file(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, file_id)
);

-- =====================================================================
-- 7. COBROS DE SESIONES (paciente → terapeuta)
-- =====================================================================

-- Tasa oficial diaria (BCV) para convertir USD ↔ Bs.
CREATE TABLE exchange_rate (
  rate_date     date          NOT NULL,
  source        text          NOT NULL DEFAULT 'BCV',
  ves_per_usd   numeric(14,4) NOT NULL CHECK (ves_per_usd > 0),
  fetched_at    timestamptz   NOT NULL DEFAULT now(),
  PRIMARY KEY (rate_date, source)
);

-- El MVP solo registra pagos; no los procesa.
CREATE TABLE session_payment (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id    text          NOT NULL,
  patient_id      uuid          NOT NULL,
  appointment_id  uuid,                         -- NULL = abono o paquete
  method          payment_method NOT NULL,
  amount_usd      numeric(12,2) NOT NULL CHECK (amount_usd > 0), -- equivalente en USD
  amount_ves      numeric(16,2) CHECK (amount_ves > 0),
  ves_per_usd     numeric(14,4) CHECK (ves_per_usd > 0),  -- tasa usada (copiada de exchange_rate)
  rate_date       date,
  reference       text,
  paid_at         timestamptz   NOT NULL DEFAULT now(),
  note            text,
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now(),
  deleted_at      timestamptz,
  FOREIGN KEY (patient_id, therapist_id) REFERENCES patient(id, therapist_id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id, patient_id) REFERENCES appointment(id, patient_id) ON DELETE SET NULL (appointment_id),
  CHECK ((amount_ves IS NULL) = (ves_per_usd IS NULL))
);
CREATE INDEX idx_session_payment_patient ON session_payment (patient_id, paid_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_session_payment_therapist_month ON session_payment (therapist_id, paid_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_session_payment_appointment ON session_payment (appointment_id) WHERE appointment_id IS NOT NULL;

-- =====================================================================
-- 8. TAREAS DEL PACIENTE (portal)
-- =====================================================================

CREATE TABLE patient_task (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id    text        NOT NULL,
  patient_id      uuid        NOT NULL,
  title           text        NOT NULL,
  instructions    text,
  frequency       task_frequency NOT NULL DEFAULT 'once',
  starts_on       date        NOT NULL DEFAULT current_date,
  due_on          date,
  asks_mood       boolean     NOT NULL DEFAULT true,   -- pide ánimo 1–10
  status          task_status NOT NULL DEFAULT 'assigned',
  completed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (patient_id, therapist_id) REFERENCES patient(id, therapist_id) ON DELETE CASCADE,
  CHECK (due_on IS NULL OR due_on >= starts_on),
  CHECK ((status = 'completed') = (completed_at IS NOT NULL))
);
CREATE INDEX idx_patient_task_patient ON patient_task (patient_id, status);

-- Registro del paciente para una tarea (ánimo + texto, cifrado).
CREATE TABLE task_entry (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id         uuid        NOT NULL REFERENCES patient_task(id) ON DELETE CASCADE,
  entry_date      date        NOT NULL DEFAULT current_date,
  mood_score      smallint    CHECK (mood_score BETWEEN 1 AND 10),
  content_enc     bytea,
  enc_key_version smallint,
  seen_by_therapist_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (mood_score IS NOT NULL OR content_enc IS NOT NULL),
  CHECK ((content_enc IS NULL) = (enc_key_version IS NULL))
);
CREATE INDEX idx_task_entry_task ON task_entry (task_id, entry_date DESC);

-- =====================================================================
-- 9. AUDITORÍA
-- =====================================================================

-- Quién vio o cambió información clínica. El backend solo inserta filas.
CREATE TABLE access_log (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  therapist_id  text        NOT NULL REFERENCES therapist(user_id) ON DELETE CASCADE,
  actor_user_id text        REFERENCES "user"(id) ON DELETE SET NULL,
  patient_id    uuid        REFERENCES patient(id) ON DELETE SET NULL,
  entity_type   text        NOT NULL,      -- 'patient', 'session_note', 'file', ...
  entity_id     text        NOT NULL,
  action        audit_action NOT NULL,
  ip            inet,
  user_agent    text,
  occurred_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_access_log_patient ON access_log (patient_id, occurred_at DESC);
CREATE INDEX idx_access_log_therapist ON access_log (therapist_id, occurred_at DESC);

COMMIT;