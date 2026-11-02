import type { payment_reminder, session_payment } from "@helsa/db/schema/payment";

export type SessionPayment = typeof session_payment.$inferSelect;
export type NewSessionPayment = typeof session_payment.$inferInsert;
export type PaymentMethod = SessionPayment["method"];
export type PaymentStatus = SessionPayment["status"];

export type PaymentReminder = typeof payment_reminder.$inferSelect;
export type NewPaymentReminder = typeof payment_reminder.$inferInsert;
