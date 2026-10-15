
import {
  bytea,
  pgEnum,
  pgTable,
} from "drizzle-orm/pg-core";
import { v7 } from "uuid";

import { appointment } from "./appointment";
import { file, } from "./patient";
import { therapist } from "./therapist";

export const note_template_kind = pgEnum("note_template_kind", [
  "free",
  "soap",
  "follow_up",
  "custom",
]);

export const note_template = pgTable(
  "note_template",
  (t) => ({
    id: t.uuid().primaryKey().$defaultFn(v7),
    // NULL = system template
    therapist_id: t.text().references(() => therapist.user_id, { onDelete: "cascade" }),
    kind: note_template_kind().notNull(),
    name: t.text().notNull(),
    structure: t.jsonb().notNull(), // sections: [{key, label, type, placeholder}]
    is_active: t.boolean().notNull().default(true),
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    updated_at: t
      .timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  }),
);

// Session note. The body is encrypted; the app decrypts it on read.
// client_id + version support offline-first writes.
export const session_note = pgTable(
  "session_note",
  (t) => ({
    id: t.uuid().primaryKey().$defaultFn(v7),
    therapist_id: t.text().notNull(),
    patient_id: t.uuid().notNull(),
    // The SQL design uses FK (appointment_id, patient_id) ON DELETE SET NULL (appointment_id),
    // which drizzle can't express; a single-column FK is used instead.
    appointment_id: t.uuid().references(() => appointment.id, { onDelete: "set null" }),
    template_id: t.uuid().references(() => note_template.id, { onDelete: "set null" }),
    title: t.text(),
    content_enc: bytea().notNull(),
    enc_key_version: t.smallint().notNull(),
    client_id: t.uuid().notNull(), // id generated on the device
    version: t.integer().notNull().default(1),
    client_updated_at: t.timestamp({ withTimezone: true }).notNull(), // device time on edit
    signed_at: t.timestamp({ withTimezone: true }), // closed note: backend blocks edits
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    updated_at: t
      .timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deleted_at: t.timestamp({ withTimezone: true }),
  })
);

// Note attachments (N:M with file).
export const session_note_file = pgTable(
  "session_note_file",
  (t) => ({
    note_id: t
      .uuid()
      .notNull()
      .references(() => session_note.id, { onDelete: "cascade" }),
    file_id: t
      .uuid()
      .notNull()
      .references(() => file.id, { onDelete: "cascade" }),
  })
);
