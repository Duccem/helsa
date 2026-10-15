import { sql } from "drizzle-orm";
import { bytea, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { v7 } from "uuid";


export const task_status = pgEnum("task_status", ["assigned", "completed", "cancelled"]);
export const task_frequency = pgEnum("task_frequency", ["once", "daily", "weekly"]);

export const patient_task = pgTable(
  "patient_task",
  (t) => ({
    id: t.uuid().primaryKey().$defaultFn(v7),
    therapist_id: t.text().notNull(),
    patient_id: t.uuid().notNull(),
    title: t.text().notNull(),
    instructions: t.text(),
    frequency: task_frequency().notNull().default("once"),
    starts_on: t
      .date()
      .notNull()
      .default(sql`current_date`),
    due_on: t.date(),
    asks_mood: t.boolean().notNull().default(true), // asks mood 1–10
    status: task_status().notNull().default("assigned"),
    completed_at: t.timestamp({ withTimezone: true }),
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    updated_at: t
      .timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  })
);

// Patient entry for a task (mood + encrypted text).
export const task_entry = pgTable(
  "task_entry",
  (t) => ({
    id: t.uuid().primaryKey().$defaultFn(v7),
    task_id: t
      .uuid()
      .notNull()
      .references(() => patient_task.id, { onDelete: "cascade" }),
    entry_date: t
      .date()
      .notNull()
      .default(sql`current_date`),
    mood_score: t.smallint(),
    content_enc: bytea(),
    enc_key_version: t.smallint(),
    seen_by_therapist_at: t.timestamp({ withTimezone: true }),
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
  })
);
