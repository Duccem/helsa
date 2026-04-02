import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 } from "uuid";
import { MedicalRecordAttachmentPayload } from "../../domain/medical-record-attachment";

export const medical_record_type = pgEnum("medical_record_type", [
  "DIAGNOSIS",
  "PRESCRIPTION",
  "NOTE",
  "LAB_RESULT",
  "IMAGING_RESULT",
  "IMMUNIZATION",
  "PROCEDURE",
  "PLAN",
  "OTHER",
]);

export const medical_record_priority = pgEnum("medical_record_priority", ["LOW", "NORMAL", "HIGH", "CRITICAL"]);
export const medical_record_status = pgEnum("medical_record_status", [
  "FINAL",
  "DRAFT",
  "AMENDED",
  "CORRECTED",
  "APPENDED",
]);

export const medical_record = pgTable("medical_record", {
  id: uuid("id").primaryKey().$defaultFn(v7),
  patient_id: uuid("patient_id").notNull(),
  doctor_id: uuid("doctor_id"),
  type: medical_record_type("type").notNull().default("OTHER"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  priority: medical_record_priority("priority").notNull().default("NORMAL"),
  tags: text("tags").array().notNull().default([]),
  status: medical_record_status("status").notNull().default("DRAFT"),
  attachments: jsonb("attachments").$type<MedicalRecordAttachmentPayload[]>().notNull().default([]),
});

