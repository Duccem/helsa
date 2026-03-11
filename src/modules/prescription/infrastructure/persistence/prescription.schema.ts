import { relations } from "drizzle-orm";
import { boolean, json, pgEnum, pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

type Drug = {
  name: string;
  brand: string;
  dosage: string;
  dosage_unit: string;
  administration_method: string;
};

export const medication_state = pgEnum("medication_state", ["PENDING", "ACTIVE", "PAUSED", "COMPLETED"]);

export const prescription = pgTable("prescription", {
  id: uuid("id").primaryKey().notNull().$defaultFn(v7),
  patient_id: uuid("patient_id").notNull(),
  doctor_id: uuid("doctor_id").notNull(),
  organization_id: uuid("organization_id").notNull(),
  observation: text("observation").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const medication = pgTable("medication", {
  id: uuid("id").primaryKey().$defaultFn(v7),
  prescription_id: uuid("prescription_id")
    .notNull()
    .references(() => prescription.id),
  patient_id: uuid("patient_id").notNull(),
  name: text("name").notNull(),
  dosage: real("dosage").notNull(),
  dosage_unit: text("dosage_unit").notNull(), // Ex: mg, UI, ml
  frequency: text("frequency").notNull(), // Ex: each 8 hours, daily
  administration_method: text("administration_method").notNull(), // Oral, Vaccine, Topic
  alternatives: json("alternatives").$type<Drug[]>().default([]),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date"),
  notes: text("notes"),
  state: medication_state("state").default("PENDING").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const medication_reminder = pgTable("medication_reminder", {
  id: uuid("id").primaryKey().$defaultFn(v7),
  medication_id: uuid("medication_id")
    .unique()
    .notNull()
    .references(() => medication.id),
  prescription_id: uuid("prescription_id")
    .notNull()
    .references(() => prescription.id),
  patient_id: uuid("patient_id").notNull(),
  scheduled_time: timestamp("scheduled_time").notNull(),
  is_taken: boolean("is_taken").default(false),
  forgotten: boolean("forgotten").default(false),
  taken_at: timestamp("taken_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const prescription_relations = relations(prescription, ({ many }) => ({
  medications: many(medication),
}));

export const medication_relations = relations(medication, ({ many }) => ({
  reminders: many(medication_reminder),
}));

