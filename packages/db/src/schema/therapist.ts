
import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

import { user } from "./auth";

// Shared with the appointment domain; defined here because availability_rule
// (upstream of appointment) also uses it and imports must not be circular.
export const appointment_modality = pgEnum("appointment_modality", ["video", "in_person", "phone"]);

// Professional profile of the psychologist (1:1 with better-auth "user").
export const therapist = pgTable(
  "therapist",
  (t) => ({
    user_id: t
      .uuid()
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    display_name: t.text().notNull(),
    professional_title: t.text(),
    license_number: t.text(),
    license_body: t.text(),
    license_verified_at: t.timestamp({ withTimezone: true }),
    license_verified_by: t.uuid().references(() => user.id, { onDelete: "set null" }),
    phone_e164: t.text(),
    country_code: t.char({ length: 2 }).notNull().default("VE"),
    timezone: t.text().notNull().default("America/Caracas"),
    booking_slug: t.text().unique(),
    booking_enabled: t.boolean().notNull().default(false),
    default_session_minutes: t.smallint().notNull().default(50),
    default_buffer_minutes: t.smallint().notNull().default(10),
    default_price_usd: t.numeric({ precision: 12, scale: 2 }),
    booking_notice_hours: t.smallint().notNull().default(12),
    reminders_enabled: t.boolean().notNull().default(true),
    // Public profile shown on the booking page.
    bio: t.text(),
    years_experience: t.smallint(),
    specialties: t.text().array().notNull().default([]),
    languages: t.text().array().notNull().default(["es"]),
    modalities: appointment_modality().array().notNull().default(["video"]),
    office_address: t.text(), // in-person sessions only
    // Payments: methods are `payment_method` values (text to avoid a circular import).
    payment_methods: t.text().array().notNull().default([]),
    payment_instructions: t.text(),
    cancellation_notice_hours: t.smallint().notNull().default(24),
    enc_key_version: t.smallint().notNull().default(1),
    onboarded_at: t.timestamp({ withTimezone: true }),
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    updated_at: t
      .timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  })
);

// Weekly availability used by the booking link.
export const availability_rule = pgTable(
  "availability_rule",
  (t) => ({
    id: t.uuid().primaryKey().$defaultFn(v7),
    therapist_id: t
      .uuid()
      .notNull()
      .references(() => therapist.user_id, { onDelete: "cascade" }),
    weekday: t.smallint().notNull(), // 0 = sunday
    start_time: t.time().notNull(),
    end_time: t.time().notNull(),
    modality: appointment_modality(), // NULL = any
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
  })
);

// One-off blocks (vacations, holidays, unforeseen events).
export const availability_block = pgTable(
  "availability_block",
  (t) => ({
    id: t.uuid().primaryKey().$defaultFn(v7),
    therapist_id: t
      .uuid()
      .notNull()
      .references(() => therapist.user_id, { onDelete: "cascade" }),
    starts_at: t.timestamp({ withTimezone: true }).notNull(),
    ends_at: t.timestamp({ withTimezone: true }).notNull(),
    reason: t.text(),
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
  })
);

// The therapist's price list (individual, couples, first consultation...).
export const therapist_rate = pgTable(
  "therapist_rate",
  (t) => ({
    id: t.uuid().primaryKey().$defaultFn(v7),
    therapist_id: t
      .uuid()
      .notNull()
      .references(() => therapist.user_id, { onDelete: "cascade" }),
    name: t.text().notNull(),
    duration_minutes: t.smallint().notNull(),
    price_usd: t.numeric({ precision: 12, scale: 2 }).notNull(),
    modality: appointment_modality(), // NULL = any
    position: t.smallint().notNull().default(0),
    is_active: t.boolean().notNull().default(true),
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    updated_at: t
      .timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  })
);
