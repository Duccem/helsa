
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
