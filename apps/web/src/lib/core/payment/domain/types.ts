import type { session_payment } from "@helsa/db/schema/payment";

export type SessionPayment = typeof session_payment.$inferSelect;
