import { defineRelations, defineRelationsPart } from "drizzle-orm";

import * as schema from "./schema";

export const appRelations = defineRelationsPart(schema, (r) => ({
  // Therapist
  therapist: {
    user: r.one.user({
      from: r.therapist.user_id,
      to: r.user.id,
      optional: false,
    }),
    license_verifier: r.one.user({
      from: r.therapist.license_verified_by,
      to: r.user.id,
    }),
    availability_rules: r.many.availability_rule({
      from: r.therapist.user_id,
      to: r.availability_rule.therapist_id,
    }),
    availability_blocks: r.many.availability_block({
      from: r.therapist.user_id,
      to: r.availability_block.therapist_id,
    }),
    patients: r.many.patient({
      from: r.therapist.user_id,
      to: r.patient.therapist_id,
    }),
    files: r.many.file({
      from: r.therapist.user_id,
      to: r.file.therapist_id,
    }),
    consent_templates: r.many.consent_template({
      from: r.therapist.user_id,
      to: r.consent_template.therapist_id,
    }),
    note_templates: r.many.note_template({
      from: r.therapist.user_id,
      to: r.note_template.therapist_id,
    }),
    access_logs: r.many.access_log({
      from: r.therapist.user_id,
      to: r.access_log.therapist_id,
    }),
  },
  availability_rule: {
    therapist: r.one.therapist({
      from: r.availability_rule.therapist_id,
      to: r.therapist.user_id,
      optional: false,
    }),
  },
  availability_block: {
    therapist: r.one.therapist({
      from: r.availability_block.therapist_id,
      to: r.therapist.user_id,
      optional: false,
    }),
  },

  // Patient
  patient: {
    therapist: r.one.therapist({
      from: r.patient.therapist_id,
      to: r.therapist.user_id,
      optional: false,
    }),
    portal_user: r.one.user({
      from: r.patient.user_id,
      to: r.user.id,
    }),
    files: r.many.file({
      from: r.patient.id,
      to: r.file.patient_id,
    }),
    consents: r.many.patient_consent({
      from: r.patient.id,
      to: r.patient_consent.patient_id,
    }),
    appointment_series: r.many.appointment_series({
      from: r.patient.id,
      to: r.appointment_series.patient_id,
    }),
    appointments: r.many.appointment({
      from: r.patient.id,
      to: r.appointment.patient_id,
    }),
    session_notes: r.many.session_note({
      from: r.patient.id,
      to: r.session_note.patient_id,
    }),
    payments: r.many.session_payment({
      from: r.patient.id,
      to: r.session_payment.patient_id,
    }),
    tasks: r.many.patient_task({
      from: r.patient.id,
      to: r.patient_task.patient_id,
    }),
    access_logs: r.many.access_log({
      from: r.patient.id,
      to: r.access_log.patient_id,
    }),
  },
  file: {
    therapist: r.one.therapist({
      from: r.file.therapist_id,
      to: r.therapist.user_id,
      optional: false,
    }),
    patient: r.one.patient({
      from: r.file.patient_id,
      to: r.patient.id,
    }),
    uploader: r.one.user({
      from: r.file.uploaded_by,
      to: r.user.id,
    }),
    session_note_files: r.many.session_note_file({
      from: r.file.id,
      to: r.session_note_file.file_id,
    }),
  },

  // Consent
  consent_template: {
    therapist: r.one.therapist({
      from: r.consent_template.therapist_id,
      to: r.therapist.user_id,
    }),
    patient_consents: r.many.patient_consent({
      from: r.consent_template.id,
      to: r.patient_consent.template_id,
    }),
  },
  patient_consent: {
    patient: r.one.patient({
      from: r.patient_consent.patient_id,
      to: r.patient.id,
      optional: false,
    }),
    template: r.one.consent_template({
      from: r.patient_consent.template_id,
      to: r.consent_template.id,
    }),
    signature_file: r.one.file({
      from: r.patient_consent.signature_file_id,
      to: r.file.id,
    }),
  },

  // Appointment
  appointment_series: {
    patient: r.one.patient({
      from: r.appointment_series.patient_id,
      to: r.patient.id,
      optional: false,
    }),
    appointments: r.many.appointment({
      from: r.appointment_series.id,
      to: r.appointment.series_id,
    }),
  },
  appointment: {
    patient: r.one.patient({
      from: r.appointment.patient_id,
      to: r.patient.id,
      optional: false,
    }),
    series: r.one.appointment_series({
      from: r.appointment.series_id,
      to: r.appointment_series.id,
    }),
    reminders: r.many.appointment_reminder({
      from: r.appointment.id,
      to: r.appointment_reminder.appointment_id,
    }),
    video_room: r.one.video_room({
      from: r.appointment.id,
      to: r.video_room.appointment_id,
    }),
    session_notes: r.many.session_note({
      from: r.appointment.id,
      to: r.session_note.appointment_id,
    }),
    payments: r.many.session_payment({
      from: r.appointment.id,
      to: r.session_payment.appointment_id,
    }),
  },
  appointment_reminder: {
    appointment: r.one.appointment({
      from: r.appointment_reminder.appointment_id,
      to: r.appointment.id,
      optional: false,
    }),
  },

  // Video
  video_room: {
    appointment: r.one.appointment({
      from: r.video_room.appointment_id,
      to: r.appointment.id,
      optional: false,
    }),
    events: r.many.video_participant_event({
      from: r.video_room.id,
      to: r.video_participant_event.room_id,
    }),
  },
  video_participant_event: {
    room: r.one.video_room({
      from: r.video_participant_event.room_id,
      to: r.video_room.id,
      optional: false,
    }),
  },

  // Note
  note_template: {
    therapist: r.one.therapist({
      from: r.note_template.therapist_id,
      to: r.therapist.user_id,
    }),
    session_notes: r.many.session_note({
      from: r.note_template.id,
      to: r.session_note.template_id,
    }),
  },
  session_note: {
    patient: r.one.patient({
      from: r.session_note.patient_id,
      to: r.patient.id,
      optional: false,
    }),
    appointment: r.one.appointment({
      from: r.session_note.appointment_id,
      to: r.appointment.id,
    }),
    template: r.one.note_template({
      from: r.session_note.template_id,
      to: r.note_template.id,
    }),
    files: r.many.file({
      from: r.session_note.id.through(r.session_note_file.note_id),
      to: r.file.id.through(r.session_note_file.file_id),
    }),
  },
  session_note_file: {
    note: r.one.session_note({
      from: r.session_note_file.note_id,
      to: r.session_note.id,
      optional: false,
    }),
    file: r.one.file({
      from: r.session_note_file.file_id,
      to: r.file.id,
      optional: false,
    }),
  },

  // Payment
  session_payment: {
    patient: r.one.patient({
      from: r.session_payment.patient_id,
      to: r.patient.id,
      optional: false,
    }),
    appointment: r.one.appointment({
      from: r.session_payment.appointment_id,
      to: r.appointment.id,
    }),
  },

  // Task
  patient_task: {
    patient: r.one.patient({
      from: r.patient_task.patient_id,
      to: r.patient.id,
      optional: false,
    }),
    entries: r.many.task_entry({
      from: r.patient_task.id,
      to: r.task_entry.task_id,
    }),
  },
  task_entry: {
    task: r.one.patient_task({
      from: r.task_entry.task_id,
      to: r.patient_task.id,
      optional: false,
    }),
  },

  // Audit
  access_log: {
    therapist: r.one.therapist({
      from: r.access_log.therapist_id,
      to: r.therapist.user_id,
      optional: false,
    }),
    actor: r.one.user({
      from: r.access_log.actor_user_id,
      to: r.user.id,
    }),
    patient: r.one.patient({
      from: r.access_log.patient_id,
      to: r.patient.id,
    }),
  },
}));

export const relations = {
  ...defineRelations(schema),
  ...schema.authRelations,
  ...appRelations,
};
