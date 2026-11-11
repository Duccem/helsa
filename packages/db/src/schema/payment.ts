
import { index, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

import { appointment, reminder_channel, reminder_status } from "./appointment";
import { user } from "./auth";
import { file, patient } from "./patient";
import { therapist } from "./therapist";

export const payment_method = pgEnum("payment_method", [
  "pago_movil",
  "zelle",
  "binance_usdt",
  "transferencia_bs",
  "efectivo_usd",
  "efectivo_bs",
  "tarjeta",
  "otro",
]);

// No payment is processed by Helsa: the therapist checks each one against their
// bank or wallet and marks it verified. Only verified payments count as collected.
export const payment_status = pgEnum("payment_status", ["pending_review", "verified", "rejected"]);
export const payment_reporter = pgEnum("payment_reporter", ["therapist", "patient"]);

// Official daily rate (BCV) to convert USD <-> Bs.
export const exchange_rate = pgTable(
  "exchange_rate",
  (t) => ({
    rate_date: t.date().notNull(),
    source: t.text().notNull().default("BCV"),
    ves_per_usd: t.numeric({ precision: 14, scale: 4 }).notNull(),
    fetched_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
  })
);

// The MVP only records payments; it does not process them.
export const session_payment = pgTable(
  "session_payment",
  (t) => ({
    id: t.uuid().primaryKey().$defaultFn(v7),
    therapist_id: t.uuid().notNull(),
    patient_id: t.uuid().notNull(),
    // NULL = deposit or package. The SQL design uses FK (appointment_id, patient_id)
    // ON DELETE SET NULL (appointment_id), which drizzle can't express.
    appointment_id: t.uuid().references(() => appointment.id, { onDelete: "set null" }),
    method: payment_method().notNull(),
    amount_usd: t.numeric({ precision: 12, scale: 2 }).notNull(), // USD equivalent
    amount_ves: t.numeric({ precision: 16, scale: 2 }),
    ves_per_usd: t.numeric({ precision: 14, scale: 4 }), // rate used (copied from exchange_rate)
    rate_date: t.date(),
    reference: t.text(),
    paid_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    note: t.text(),
    status: payment_status().notNull().default("pending_review"),
    reported_by: payment_reporter().notNull().default("therapist"),
    // Receipt (screenshot or PDF) stored as an encrypted patient file.
    proof_file_id: t.uuid().references(() => file.id, { onDelete: "set null" }),
    verified_at: t.timestamp({ withTimezone: true }),
    verified_by: t.uuid().references(() => user.id, { onDelete: "set null" }),
    rejected_at: t.timestamp({ withTimezone: true }),
    rejection_reason: t.text(),
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    updated_at: t
      .timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deleted_at: t.timestamp({ withTimezone: true }),
  })
);

// Payment reminders sent to a patient. Append-only log: it tells the payments
// page who was already reminded, when, and through which channel.
export const payment_reminder = pgTable(
  "payment_reminder",
  (t) => ({
    id: t.uuid().primaryKey().$defaultFn(v7),
    therapist_id: t
      .uuid()
      .notNull()
      .references(() => therapist.user_id, { onDelete: "cascade" }),
    patient_id: t
      .uuid()
      .notNull()
      .references(() => patient.id, { onDelete: "cascade" }),
    channel: reminder_channel().notNull(),
    amount_usd: t.numeric({ precision: 12, scale: 2 }).notNull(), // balance owed when sent
    sessions: t.smallint().notNull().default(0), // unpaid sessions it covered
    // "sent" when a provider delivered it; "skipped" when it was handed to the
    // therapist to send themselves (a WhatsApp or mail link).
    status: reminder_status().notNull().default("pending"),
    provider: t.text().notNull(), // e.g. "whatsapp_link", "mailto", "resend", "kapso"
    provider_message_id: t.text(),
    error: t.text(),
    sent_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
  }),
  (t) => [index("idx_payment_reminder_patient").on(t.therapist_id, t.patient_id, t.sent_at)],
);
