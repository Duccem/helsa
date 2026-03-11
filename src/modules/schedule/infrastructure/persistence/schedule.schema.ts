import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, time, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const schedule = pgTable("schedule", {
  id: uuid("id").$defaultFn(v7).primaryKey(),
  doctor_id: uuid("doctor_id").notNull().unique(),
  appointment_duration: integer("appointment_duration").notNull().default(30),
  max_appointments_per_day: integer("max_appointments_per_day").notNull().default(5),
  next_availability_generation: timestamp("next_availability_generation").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const schedule_day = pgTable("schedule_day", {
  id: uuid("id").$defaultFn(v7).primaryKey(),
  schedule_id: uuid("schedule_id")
    .notNull()
    .references(() => schedule.id),

  day: integer("day").notNull().default(1),
  start_hour: time("start_hour").notNull(),
  end_hour: time("end_hour").notNull(),
});

export const slot_state = pgEnum("slot_state", ["TAKEN", "AVAILABLE"]);

export const availability_slot = pgTable("availability_slot", {
  id: uuid("id").$defaultFn(v7).primaryKey(),
  doctor_id: uuid("doctor_id").notNull(),
  date: timestamp("date").notNull(),
  hour: time("hour").notNull(),
  state: slot_state("state").default("AVAILABLE").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const schedule_relations = relations(schedule, ({ many }) => ({
  days: many(schedule_day),
}));

export const schedule_day_relations = relations(schedule_day, ({ one }) => ({
  schedule: one(schedule, {
    fields: [schedule_day.schedule_id],
    references: [schedule.id],
  }),
}));

