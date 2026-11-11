
import {
  bytea,
  pgEnum,
  pgTable,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { v7 } from "uuid";

import { appointment_modality } from "./therapist";

export const appointment_status = pgEnum("appointment_status", [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
]);
export const booking_source = pgEnum("booking_source", [
  "therapist",
  "booking_link",
  "patient_portal",
]);
export const cancelled_by = pgEnum("cancelled_by", ["therapist", "patient", "system"]);
export const reminder_channel = pgEnum("reminder_channel", ["whatsapp", "email"]);
export const reminder_kind = pgEnum("reminder_kind", [
  "h24",
  "h2",
  "booking_confirmation",
  "cancellation",
]);
export const reminder_status = pgEnum("reminder_status", [
  "pending",
  "sent",
  "delivered",
  "read",
  "failed",
  "skipped",
]);
export const reminder_response = pgEnum("reminder_response", ["confirmed", "cancelled"]);

// Recurring series (concrete appointments are materialized in appointment).
export const appointment_series = pgTable(
  "appointment_series",
  (t) => ({
    id: t.uuid().primaryKey().$defaultFn(v7),
    therapist_id: t.uuid().notNull(),
    patient_id: t.uuid().notNull(),
    rrule: t.text().notNull(), // RFC 5545, e.g. 'FREQ=WEEKLY;BYDAY=TU'
    local_start_time: t.time().notNull(),
    duration_minutes: t.smallint().notNull(),
    timezone: t.text().notNull().default("America/Caracas"),
    modality: appointment_modality().notNull().default("video"),
    starts_on: t.date().notNull(),
    ends_on: t.date(),
    materialized_until: t.date(), // how far appointments have been generated
    is_active: t.boolean().notNull().default(true),
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    updated_at: t
      .timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  })
);

// NOTE: the `no_overlapping_appointments` EXCLUDE constraint (btree_gist) is not
// supported by drizzle and must be added in a custom migration.
export const appointment = pgTable(
  "appointment",
  (t) => ({
    id: t.uuid().primaryKey().$defaultFn(v7),
    therapist_id: t.uuid().notNull(),
    patient_id: t.uuid().notNull(),
    series_id: t.uuid().references(() => appointment_series.id, { onDelete: "set null" }),
    starts_at: t.timestamp({ withTimezone: true }).notNull(),
    ends_at: t.timestamp({ withTimezone: true }).notNull(),
    modality: appointment_modality().notNull().default("video"),
    status: appointment_status().notNull().default("scheduled"),
    booked_via: booking_source().notNull().default("therapist"),
    price_usd: t.numeric({ precision: 12, scale: 2 }), // price frozen at booking time
    // How the patient said they will pay (a `payment_method` value; text to avoid a circular import).
    payment_method: t.text(),
    location: t.text(), // in person only
    confirmed_at: t.timestamp({ withTimezone: true }),
    cancelled_at: t.timestamp({ withTimezone: true }),
    cancelled_by: cancelled_by(),
    cancel_reason: t.text(),
    completed_at: t.timestamp({ withTimezone: true }),
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    updated_at: t
      .timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  }),
);

// Scheduled reminders (WhatsApp / email).
export const appointment_reminder = pgTable(
  "appointment_reminder",
  (t) => ({
    id: t.uuid().primaryKey().$defaultFn(v7),
    appointment_id: t
      .uuid()
      .notNull()
      .references(() => appointment.id, { onDelete: "cascade" }),
    channel: reminder_channel().notNull(),
    kind: reminder_kind().notNull(),
    scheduled_for: t.timestamp({ withTimezone: true }).notNull(),
    status: reminder_status().notNull().default("pending"),
    provider_message_id: t.text(),
    attempts: t.smallint().notNull().default(0),
    sent_at: t.timestamp({ withTimezone: true }),
    error: t.text(),
    response_token_hash: bytea().unique(), // "confirm / cancel" link (hash only)
    response: reminder_response(),
    responded_at: t.timestamp({ withTimezone: true }),
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
  }),
  // One reminder of each kind per channel: the cron job claims it by inserting
  // first, so overlapping runs never send the same reminder twice.
  (t) => [
    uniqueIndex("uq_appointment_reminder").on(t.appointment_id, t.kind, t.channel),
  ],
);
