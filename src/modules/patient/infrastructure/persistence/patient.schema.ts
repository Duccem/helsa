import { relations } from "drizzle-orm";
import { pgEnum, pgTable, timestamp, uuid, text, real } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const patient_gender = pgEnum("patient_gender", ["MAN", "WOMAN", "OTHER"]);

export const patient = pgTable("patient", {
  id: uuid("id").primaryKey().$defaultFn(v7),
  user_id: uuid("user_id"),
  email: text("email").notNull(),
  name: text("name").notNull(),
  birth_date: timestamp("birth_date").notNull(),
  gender: patient_gender("gender").notNull().default("OTHER"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const contact_info = pgTable("contact_info", {
  id: uuid("id").primaryKey().$defaultFn(v7),
  patient_id: uuid("patient_id")
    .notNull()
    .references(() => patient.id),
  phone: text("phone"),
  address: text("address"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const vitals = pgTable("vitals", {
  id: uuid("id").primaryKey().$defaultFn(v7),
  patient_id: uuid("patient_id")
    .notNull()
    .references(() => patient.id),
  blood_pressure: real("blood_pressure").default(0),
  heart_rate: real("heart_rate").default(0),
  respiratory_rate: real("respiratory_rate").default(0),
  oxygen_saturation: real("oxygen_saturation").default(0),
  temperature: real("temperature").default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const physical_information = pgTable("physical_information", {
  id: uuid("id").primaryKey().$defaultFn(v7),
  patient_id: uuid("patient_id")
    .notNull()
    .references(() => patient.id),
  height: real("height").default(0),
  weight: real("weight").default(0),
  blood_type: text("blood_type"),
  body_mass_index: real("body_mass_index").default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const patient_relations = relations(patient, ({ many, one }) => ({
  contact_info: many(contact_info),
  vitals: many(vitals),
  physical_information: one(physical_information),
}));

export const contact_info_relations = relations(contact_info, ({ one }) => ({
  patient: one(patient, {
    fields: [contact_info.patient_id],
    references: [patient.id],
  }),
}));

export const vitals_relations = relations(vitals, ({ one }) => ({
  patient: one(patient, {
    fields: [vitals.patient_id],
    references: [patient.id],
  }),
}));

export const physical_information_relations = relations(physical_information, ({ one }) => ({
  patient: one(patient, {
    fields: [physical_information.patient_id],
    references: [patient.id],
  }),
}));

