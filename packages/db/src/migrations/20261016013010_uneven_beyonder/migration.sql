CREATE TYPE "appointment_status" AS ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "booking_source" AS ENUM('therapist', 'booking_link', 'patient_portal');--> statement-breakpoint
CREATE TYPE "cancelled_by" AS ENUM('therapist', 'patient', 'system');--> statement-breakpoint
CREATE TYPE "reminder_channel" AS ENUM('whatsapp', 'email');--> statement-breakpoint
CREATE TYPE "reminder_kind" AS ENUM('h24', 'h2', 'booking_confirmation', 'cancellation');--> statement-breakpoint
CREATE TYPE "reminder_response" AS ENUM('confirmed', 'cancelled');--> statement-breakpoint
CREATE TYPE "reminder_status" AS ENUM('pending', 'sent', 'delivered', 'read', 'failed', 'skipped');--> statement-breakpoint
CREATE TYPE "audit_action" AS ENUM('view', 'create', 'update', 'delete', 'export', 'sign');--> statement-breakpoint
CREATE TYPE "note_template_kind" AS ENUM('free', 'soap', 'follow_up', 'custom');--> statement-breakpoint
CREATE TYPE "patient_status" AS ENUM('prospect', 'active', 'inactive', 'discharged');--> statement-breakpoint
CREATE TYPE "payment_method" AS ENUM('pago_movil', 'zelle', 'binance_usdt', 'transferencia_bs', 'efectivo_usd', 'efectivo_bs', 'tarjeta', 'otro');--> statement-breakpoint
CREATE TYPE "task_frequency" AS ENUM('once', 'daily', 'weekly');--> statement-breakpoint
CREATE TYPE "task_status" AS ENUM('assigned', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "appointment_modality" AS ENUM('video', 'in_person', 'phone');--> statement-breakpoint
CREATE TYPE "participant_role" AS ENUM('therapist', 'patient');--> statement-breakpoint
CREATE TYPE "video_provider" AS ENUM('livekit', 'daily');--> statement-breakpoint
CREATE TABLE "appointment" (
	"id" uuid PRIMARY KEY,
	"therapist_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"series_id" uuid,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"modality" "appointment_modality" DEFAULT 'video'::"appointment_modality" NOT NULL,
	"status" "appointment_status" DEFAULT 'scheduled'::"appointment_status" NOT NULL,
	"booked_via" "booking_source" DEFAULT 'therapist'::"booking_source" NOT NULL,
	"price_usd" numeric(12,2),
	"location" text,
	"confirmed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"cancelled_by" "cancelled_by",
	"cancel_reason" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointment_reminder" (
	"id" uuid PRIMARY KEY,
	"appointment_id" uuid NOT NULL,
	"channel" "reminder_channel" NOT NULL,
	"kind" "reminder_kind" NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"status" "reminder_status" DEFAULT 'pending'::"reminder_status" NOT NULL,
	"provider_message_id" text,
	"attempts" smallint DEFAULT 0 NOT NULL,
	"sent_at" timestamp with time zone,
	"error" text,
	"response_token_hash" bytea UNIQUE,
	"response" "reminder_response",
	"responded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointment_series" (
	"id" uuid PRIMARY KEY,
	"therapist_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"rrule" text NOT NULL,
	"local_start_time" time NOT NULL,
	"duration_minutes" smallint NOT NULL,
	"timezone" text DEFAULT 'America/Caracas' NOT NULL,
	"modality" "appointment_modality" DEFAULT 'video'::"appointment_modality" NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date,
	"materialized_until" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "access_log" (
	"id" uuid PRIMARY KEY,
	"therapist_id" uuid NOT NULL,
	"actor_user_id" uuid,
	"patient_id" uuid,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"action" "audit_action" NOT NULL,
	"ip" inet,
	"user_agent" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" text NOT NULL,
	"inviter_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"role" text NOT NULL,
	"status" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"logo" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	"active_organization_id" uuid,
	"impersonated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consent_template" (
	"id" uuid PRIMARY KEY,
	"therapist_id" uuid,
	"title" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"body_md" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient_consent" (
	"id" uuid PRIMARY KEY,
	"therapist_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"template_id" uuid,
	"body_snapshot_md" text NOT NULL,
	"body_sha256" bytea NOT NULL,
	"sign_token_hash" bytea UNIQUE,
	"sign_token_expires_at" timestamp with time zone,
	"signed_name" text,
	"signed_at" timestamp with time zone,
	"signer_ip" inet,
	"signer_user_agent" text,
	"signature_file_id" uuid,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "note_template" (
	"id" uuid PRIMARY KEY,
	"therapist_id" uuid,
	"kind" "note_template_kind" NOT NULL,
	"name" text NOT NULL,
	"structure" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_note" (
	"id" uuid PRIMARY KEY,
	"therapist_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"appointment_id" uuid,
	"template_id" uuid,
	"title" text,
	"content_enc" bytea NOT NULL,
	"enc_key_version" smallint NOT NULL,
	"client_id" uuid NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"client_updated_at" timestamp with time zone NOT NULL,
	"signed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "session_note_file" (
	"note_id" uuid NOT NULL,
	"file_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file" (
	"id" uuid PRIMARY KEY,
	"therapist_id" uuid NOT NULL,
	"patient_id" uuid,
	"uploaded_by" uuid,
	"storage_key" text NOT NULL UNIQUE,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"sha256" bytea,
	"is_encrypted" boolean DEFAULT true NOT NULL,
	"enc_key_version" smallint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "patient" (
	"id" uuid PRIMARY KEY,
	"therapist_id" uuid NOT NULL,
	"user_id" uuid UNIQUE,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"preferred_name" text,
	"national_id" text,
	"birth_date" date,
	"gender" text,
	"email" text,
	"phone_e164" text,
	"whatsapp_opt_in" boolean DEFAULT false NOT NULL,
	"country_code" char(2) DEFAULT 'VE' NOT NULL,
	"city" text,
	"timezone" text DEFAULT 'America/Caracas' NOT NULL,
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"emergency_contact_relation" text,
	"intake_reason_enc" bytea,
	"enc_key_version" smallint,
	"status" "patient_status" DEFAULT 'active'::"patient_status" NOT NULL,
	"session_price_usd" numeric(12,2),
	"portal_enabled" boolean DEFAULT false NOT NULL,
	"first_session_at" timestamp with time zone,
	"discharged_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "exchange_rate" (
	"rate_date" date NOT NULL,
	"source" text DEFAULT 'BCV' NOT NULL,
	"ves_per_usd" numeric(14,4) NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_payment" (
	"id" uuid PRIMARY KEY,
	"therapist_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"appointment_id" uuid,
	"method" "payment_method" NOT NULL,
	"amount_usd" numeric(12,2) NOT NULL,
	"amount_ves" numeric(16,2),
	"ves_per_usd" numeric(14,4),
	"rate_date" date,
	"reference" text,
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "patient_task" (
	"id" uuid PRIMARY KEY,
	"therapist_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"title" text NOT NULL,
	"instructions" text,
	"frequency" "task_frequency" DEFAULT 'once'::"task_frequency" NOT NULL,
	"starts_on" date DEFAULT current_date NOT NULL,
	"due_on" date,
	"asks_mood" boolean DEFAULT true NOT NULL,
	"status" "task_status" DEFAULT 'assigned'::"task_status" NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_entry" (
	"id" uuid PRIMARY KEY,
	"task_id" uuid NOT NULL,
	"entry_date" date DEFAULT current_date NOT NULL,
	"mood_score" smallint,
	"content_enc" bytea,
	"enc_key_version" smallint,
	"seen_by_therapist_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "availability_block" (
	"id" uuid PRIMARY KEY,
	"therapist_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "availability_rule" (
	"id" uuid PRIMARY KEY,
	"therapist_id" uuid NOT NULL,
	"weekday" smallint NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"modality" "appointment_modality",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "therapist" (
	"user_id" uuid PRIMARY KEY,
	"display_name" text NOT NULL,
	"professional_title" text,
	"license_number" text,
	"license_body" text,
	"license_verified_at" timestamp with time zone,
	"license_verified_by" uuid,
	"phone_e164" text,
	"country_code" char(2) DEFAULT 'VE' NOT NULL,
	"timezone" text DEFAULT 'America/Caracas' NOT NULL,
	"booking_slug" text UNIQUE,
	"booking_enabled" boolean DEFAULT false NOT NULL,
	"default_session_minutes" smallint DEFAULT 50 NOT NULL,
	"default_buffer_minutes" smallint DEFAULT 10 NOT NULL,
	"default_price_usd" numeric(12,2),
	"booking_notice_hours" smallint DEFAULT 12 NOT NULL,
	"reminders_enabled" boolean DEFAULT true NOT NULL,
	"enc_key_version" smallint DEFAULT 1 NOT NULL,
	"onboarded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_participant_event" (
	"id" uuid PRIMARY KEY,
	"room_id" uuid NOT NULL,
	"role" "participant_role" NOT NULL,
	"event_type" text NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"bitrate_kbps" integer,
	"packet_loss_pct" numeric(5,2),
	"client_info" jsonb
);
--> statement-breakpoint
CREATE TABLE "video_room" (
	"id" uuid PRIMARY KEY,
	"appointment_id" uuid NOT NULL UNIQUE,
	"provider" "video_provider" DEFAULT 'livekit'::"video_provider" NOT NULL,
	"room_name" text NOT NULL UNIQUE,
	"patient_join_token_hash" bytea UNIQUE,
	"opens_at" timestamp with time zone NOT NULL,
	"closes_at" timestamp with time zone NOT NULL,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"duration_seconds" integer,
	"audio_only_seconds" integer DEFAULT 0 NOT NULL,
	"reconnect_count" integer DEFAULT 0 NOT NULL,
	"billed_participant_minutes" numeric(10,2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "member_user_org_idx" ON "member" ("user_id","organization_id");--> statement-breakpoint
CREATE INDEX "organization_slug_idx" ON "organization" ("slug");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_series_id_appointment_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "appointment_series"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "appointment_reminder" ADD CONSTRAINT "appointment_reminder_appointment_id_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointment"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "access_log" ADD CONSTRAINT "access_log_therapist_id_therapist_user_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "therapist"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "access_log" ADD CONSTRAINT "access_log_actor_user_id_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "access_log" ADD CONSTRAINT "access_log_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id");--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id");--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_impersonated_by_user_id_fkey" FOREIGN KEY ("impersonated_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "consent_template" ADD CONSTRAINT "consent_template_therapist_id_therapist_user_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "therapist"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "patient_consent" ADD CONSTRAINT "patient_consent_template_id_consent_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "consent_template"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "patient_consent" ADD CONSTRAINT "patient_consent_signature_file_id_file_id_fkey" FOREIGN KEY ("signature_file_id") REFERENCES "file"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "note_template" ADD CONSTRAINT "note_template_therapist_id_therapist_user_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "therapist"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session_note" ADD CONSTRAINT "session_note_appointment_id_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointment"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "session_note" ADD CONSTRAINT "session_note_template_id_note_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "note_template"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "session_note_file" ADD CONSTRAINT "session_note_file_note_id_session_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "session_note"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session_note_file" ADD CONSTRAINT "session_note_file_file_id_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_therapist_id_therapist_user_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "therapist"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_therapist_id_therapist_user_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "therapist"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "session_payment" ADD CONSTRAINT "session_payment_appointment_id_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointment"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "task_entry" ADD CONSTRAINT "task_entry_task_id_patient_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "patient_task"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "availability_block" ADD CONSTRAINT "availability_block_therapist_id_therapist_user_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "therapist"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "availability_rule" ADD CONSTRAINT "availability_rule_therapist_id_therapist_user_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "therapist"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "therapist" ADD CONSTRAINT "therapist_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "therapist" ADD CONSTRAINT "therapist_license_verified_by_user_id_fkey" FOREIGN KEY ("license_verified_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "video_participant_event" ADD CONSTRAINT "video_participant_event_room_id_video_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "video_room"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "video_room" ADD CONSTRAINT "video_room_appointment_id_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointment"("id") ON DELETE CASCADE;