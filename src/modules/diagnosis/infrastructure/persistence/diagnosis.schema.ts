import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const diagnosis_certainty = pgEnum("diagnosis_certainty", [
  "PRESUMPTIVE",
  "DIFFERENTIAL",
  "DEFINITIVE",
  "DISCARD",
]);
export const diagnosis_state = pgEnum("diagnosis_state", ["ACTIVE", "REMISSION", "CURED", "RECURRENT", "DECEASED"]);
export const diagnosis_income = pgEnum("diagnosis_income", ["INCOME", "PRINCIPAL", "SECONDARY", "EGRESS"]);

export const diagnosis = pgTable("diagnosis", {
  id: uuid("id").$defaultFn(v7).primaryKey(),
  summary: text("summary").notNull(),
  cie_code: text("cie_code").notNull(),
  certainty: diagnosis_certainty("certainty").default("PRESUMPTIVE").notNull(),
  state: diagnosis_state("state").default("ACTIVE").notNull(),
  income: diagnosis_income("income").default("INCOME").notNull(),
  patient_id: uuid("patient_id").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

