
import { bytea, pgTable, } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

import { file, } from "./patient";
import { therapist } from "./therapist";

// Versioned consent templates (system-wide or per therapist).
export const consent_template = pgTable(
  "consent_template",
  (t) => ({
    id: t.uuid().primaryKey().$defaultFn(v7),
    // NULL = system template
    therapist_id: t.text().references(() => therapist.user_id, { onDelete: "cascade" }),
    title: t.text().notNull(),
    version: t.integer().notNull().default(1),
    body_md: t.text().notNull(),
    is_active: t.boolean().notNull().default(true),
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
  })
);

// Consent signed by a patient: stores an exact copy of the text.
export const patient_consent = pgTable(
  "patient_consent",
  (t) => ({
    id: t.uuid().primaryKey().$defaultFn(v7),
    therapist_id: t.text().notNull(),
    patient_id: t.uuid().notNull(),
    template_id: t.uuid().references(() => consent_template.id, { onDelete: "set null" }),
    body_snapshot_md: t.text().notNull(),
    body_sha256: bytea().notNull(),
    sign_token_hash: bytea().unique(), // signing link token (hash only)
    sign_token_expires_at: t.timestamp({ withTimezone: true }),
    signed_name: t.text(),
    signed_at: t.timestamp({ withTimezone: true }),
    signer_ip: t.inet(),
    signer_user_agent: t.text(),
    signature_file_id: t.uuid().references(() => file.id, { onDelete: "set null" }),
    revoked_at: t.timestamp({ withTimezone: true }),
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
  })
);
