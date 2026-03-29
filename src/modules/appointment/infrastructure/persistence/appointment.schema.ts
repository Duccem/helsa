import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, time, timestamp, uuid } from "drizzle-orm/pg-core";
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
export const appointment_payment_mode = pgEnum("appointment_payment_mode", ["PREPAID", "POSTPAID", "CREDIT"]);

export const appointment_payment_method = pgEnum("appointment_payment_method", [
  "CASH",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "BANK_TRANSFER",
  "MOBILE_PAYMENT",
  "CHECK",
  "OTHER",
]);

export const appointment_payment_status = pgEnum("appointment_payment_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
  "PARTIAL",
]);

export const appointment = pgTable("appointment", {
  id: uuid("id").$defaultFn(v7).primaryKey(),
  organization_id: uuid("organization_id"),
  patient_id: uuid("patient_id").notNull(),
  doctor_id: uuid("doctor_id").notNull(),
  date: timestamp("date").notNull(),
  hour: time("hour").default("08:00:00").notNull(),
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

export const appointment_payment = pgTable("appointment_payment", {
  id: uuid("id").$defaultFn(v7).primaryKey(),
  appointment_id: uuid("appointment_id")
    .notNull()
    .unique()
    .references(() => appointment.id),
  amount: integer("amount").notNull(),
  current_paid_amount: integer("current_paid_amount").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  payment_mode: appointment_payment_mode("payment_mode").notNull(),
  payment_method: appointment_payment_method("payment_method").notNull(),
  payment_status: appointment_payment_status("payment_status").notNull(),
  payment_date: timestamp("payment_date").defaultNow(),
});

export const appointment_relations = relations(appointment, ({ many, one }) => ({
  notes: many(appointment_note),
  rating: one(appointment_rating, {
    fields: [appointment.id],
    references: [appointment_rating.appointment_id],
  }),
  payment: one(appointment_payment, {
    fields: [appointment.id],
    references: [appointment_payment.appointment_id],
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

export const appointment_payment_relations = relations(appointment_payment, ({ one }) => ({
  appointment: one(appointment, {
    fields: [appointment_payment.appointment_id],
    references: [appointment.id],
  }),
}));

