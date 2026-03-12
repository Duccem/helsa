import { relations } from "drizzle-orm";
import { pgEnum, pgTable, timestamp, uuid, text } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const patient_gender = pgEnum("patient_gender", ["MAN", "WOMAN", "OTHER"]);

export const patient = pgTable("patient", {
  id: uuid("id").primaryKey().$defaultFn(v7),
  organization_id: uuid("organization_id").notNull(),
  user_id: uuid("user_id").notNull(),
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

export const patient_relations = relations(patient, ({ many }) => ({
  contact_info: many(contact_info),
}));

export const contact_info_relations = relations(contact_info, ({ one }) => ({
  patient: one(patient, {
    fields: [contact_info.patient_id],
    references: [patient.id],
  }),
}));

