
import {
  bytea,
  pgEnum,
  pgTable,
} from "drizzle-orm/pg-core";
import { v7 } from "uuid";

import { user } from "./auth";
import { therapist } from "./therapist";

export const patient_status = pgEnum("patient_status", [
  "prospect",
  "active",
  "inactive",
  "discharged",
]);

export const patient = pgTable(
  "patient",
  (t) => ({
    id: t.uuid().primaryKey().$defaultFn(v7),
    therapist_id: t
      .text()
      .notNull()
      .references(() => therapist.user_id, { onDelete: "cascade" }),
    // Portal access (better-auth magic-link user).
    user_id: t
      .text()
      .unique()
      .references(() => user.id, { onDelete: "set null" }),
    first_name: t.text().notNull(),
    last_name: t.text().notNull(),
    preferred_name: t.text(),
    national_id: t.text(),
    birth_date: t.date(),
    gender: t.text(),
    email: t.text(),
    phone_e164: t.text(),
    whatsapp_opt_in: t.boolean().notNull().default(false),
    country_code: t.char({ length: 2 }).notNull().default("VE"),
    city: t.text(),
    timezone: t.text().notNull().default("America/Caracas"),
    emergency_contact_name: t.text(),
    emergency_contact_phone: t.text(),
    emergency_contact_relation: t.text(),
    intake_reason_enc: bytea(), // encrypted by the application
    enc_key_version: t.smallint(),
    status: patient_status().notNull().default("active"),
    session_price_usd: t.numeric({ precision: 12, scale: 2 }), // NULL = therapist default
    portal_enabled: t.boolean().notNull().default(false),
    first_session_at: t.timestamp({ withTimezone: true }),
    discharged_at: t.timestamp({ withTimezone: true }),
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    updated_at: t
      .timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deleted_at: t.timestamp({ withTimezone: true }), // soft delete
  })
);

// Files in object storage (clinical attachments and consent signatures).
export const file = pgTable(
  "file",
  (t) => ({
    id: t.uuid().primaryKey().$defaultFn(v7),
    therapist_id: t
      .text()
      .notNull()
      .references(() => therapist.user_id, { onDelete: "cascade" }),
    patient_id: t.uuid(),
    uploaded_by: t.text().references(() => user.id, { onDelete: "set null" }),
    storage_key: t.text().notNull().unique(),
    original_name: t.text().notNull(),
    mime_type: t.text().notNull(),
    size_bytes: t.integer().notNull(),
    sha256: bytea(),
    is_encrypted: t.boolean().notNull().default(true),
    enc_key_version: t.smallint(),
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    deleted_at: t.timestamp({ withTimezone: true }),
  })
);
