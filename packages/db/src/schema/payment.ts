
import { pgEnum, pgTable, } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

import { appointment } from "./appointment";

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
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    updated_at: t
      .timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deleted_at: t.timestamp({ withTimezone: true }),
  })
);
