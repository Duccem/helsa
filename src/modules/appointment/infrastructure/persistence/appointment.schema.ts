import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const appointment_type = pgEnum("appointment_type", [
  "INITIAL",
  "THERAPY",
  "CONSULTATION",
  "FOLLOW_UP",
  "CHECK_UP",
  "EMERGENCY",
  "PROCEDURE",
]);
export const appointment_mode = pgEnum("appointment_mode", ["ONLINE", "IN_PERSON"]);
export const appointment_status = pgEnum("appointment_status", [
  "SCHEDULED",
  "CONFIRMED",
  "PAYED",
  "READY",
  "STARTED",
  "CANCELLED",
  "MISSED_BY_PATIENT",
  "MISSED_BY_THERAPIST",
  "FINISHED",
]);

export const appointment = pgTable("appointment", {
  id: uuid("id").$defaultFn(v7).primaryKey(),
  organization_id: uuid("organization_id"),
  patient_id: uuid("patient_id").notNull(),
  doctor_id: uuid("doctor_id").notNull(),
  date: timestamp("date").notNull(),
  motive: text("motive").notNull(),
  type: appointment_type("type").default("CONSULTATION").notNull(),
  mode: appointment_mode("mode").default("ONLINE").notNull(),
  status: appointment_status("status").default("SCHEDULED").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const appointment_rating = pgTable("appointment_rating", {
  id: uuid("id").$defaultFn(v7).primaryKey(),
  appointment_id: uuid("appointment_id")
    .notNull()
    .unique()
    .references(() => appointment.id),
  patient_id: uuid("patient_id").notNull(),
  doctor_id: uuid("doctor_id").notNull(),
  score: integer("score").notNull().default(1),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const appointment_note = pgTable("appointment_note", {
  id: uuid("id").$defaultFn(v7).primaryKey(),
  note: text("note").notNull(),
  appointment_id: uuid("appointment_id")
    .notNull()
    .references(() => appointment.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const appointment_relations = relations(appointment, ({ many, one }) => ({
  notes: many(appointment_note),
  rating: one(appointment_rating, {
    fields: [appointment.id],
    references: [appointment_rating.appointment_id],
  }),
}));

export const appointment_note_relations = relations(appointment_note, ({ one }) => ({
  appointment: one(appointment, {
    fields: [appointment_note.appointment_id],
    references: [appointment.id],
  }),
}));

export const appointment_rating_relations = relations(appointment_rating, ({ one }) => ({
  appointment: one(appointment, {
    fields: [appointment_rating.appointment_id],
    references: [appointment.id],
  }),
}));

