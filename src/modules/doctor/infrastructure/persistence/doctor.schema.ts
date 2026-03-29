import { relations } from "drizzle-orm";
import { integer, jsonb, pgEnum, pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const specialty = pgTable("specialty", {
  id: uuid("id").$defaultFn(v7).primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
});

export const doctor = pgTable("doctor", {
  id: uuid("id").$defaultFn(v7).primaryKey(),
  user_id: uuid("user_id").notNull().unique(),
  specialty_id: uuid("specialty_id")
    .notNull()
    .references(() => specialty.id),
  license_number: text("license_number").notNull(),
  bio: text("bio"),
  score: real("score").notNull().default(0.0),
  experience: integer("experience").notNull().default(1),
  next_availability_generation: timestamp("next_availability_generation"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const price_payment_mode = pgEnum("price_payment_mode", ["PREPAID", "POSTPAID", "CREDIT"]);

export const price = pgTable("price", {
  id: uuid("id").$defaultFn(v7).primaryKey(),
  doctor_id: uuid("therapist_id")
    .notNull()
    .references(() => doctor.id),
  amount: real("amount").notNull().default(10.0),
  payment_mode: price_payment_mode("payment_mode").notNull().default("PREPAID"),
});

export const office_address = pgTable("office_address", {
  id: uuid("id").$defaultFn(v7).primaryKey(),
  doctor_id: uuid("therapist_id")
    .notNull()
    .references(() => doctor.id),
  address: text("address").notNull(),
  location: jsonb("location").$type<{ latitude: number; longitude: number }>().notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const education = pgTable("education", {
  id: uuid("id").$defaultFn(v7).primaryKey(),
  doctor_id: uuid("therapist_id")
    .notNull()
    .references(() => doctor.id),
  title: text("title").notNull(),
  institution: text("institution").notNull(),
  graduated_at: timestamp("graduated_at").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const doctor_relations = relations(doctor, ({ one, many }) => ({
  specialty: one(specialty, {
    fields: [doctor.specialty_id],
    references: [specialty.id],
  }),
  prices: many(price),
  office_addresses: many(office_address),
  education: many(education),
}));

export const specialty_relations = relations(specialty, ({ many }) => ({
  doctors: many(doctor),
}));

export const price_relations = relations(price, ({ one }) => ({
  doctor: one(doctor, {
    fields: [price.doctor_id],
    references: [doctor.id],
  }),
}));

export const office_address_relations = relations(office_address, ({ one }) => ({
  doctor: one(doctor, {
    fields: [office_address.doctor_id],
    references: [doctor.id],
  }),
}));

export const education_relations = relations(education, ({ one }) => ({
  doctor: one(doctor, {
    fields: [education.doctor_id],
    references: [doctor.id],
  }),
}));

