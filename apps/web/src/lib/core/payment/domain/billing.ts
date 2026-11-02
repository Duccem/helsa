import type { AppointmentStatus } from "../../appointment/domain/types";

/*
 * Helsa stores payments, not invoices. What a session "owes" is derived from
 * its frozen price and the payments linked to it:
 *
 *   paid       verified payments cover the price
 *   in_review  a payment is waiting for the therapist to check it
 *   partial    the session already happened and only part is paid
 *   pending    the session already happened and nothing is paid
 *   overdue    pending (or partial) for more than OVERDUE_DAYS
 *   upcoming   the session hasn't happened yet and isn't paid
 *   no_show    the patient didn't come and nothing is paid
 *   unpriced   no price on the session, patient or therapist
 *
 * Cancelled sessions never owe anything; money paid for them is a credit.
 */

export const OVERDUE_DAYS = 7;

export const chargeStatuses = [
  "paid",
  "in_review",
  "partial",
  "pending",
  "overdue",
  "upcoming",
  "no_show",
  "unpriced",
] as const;
export type ChargeStatus = (typeof chargeStatuses)[number];

/** Statuses whose remaining amount the patient owes today. */
export const OWED: ReadonlySet<ChargeStatus> = new Set(["partial", "pending", "overdue"]);

export type Charge = {
  status: AppointmentStatus;
  startsAt: Date;
  endsAt: Date;
  priceUsd: number | null;
  /** Verified payments. */
  paidUsd: number;
  /** Payments waiting for review. */
  reviewUsd: number;
};

const DAY = 86_400_000;
const CENT = 0.005;

export const round2 = (value: number) => Math.round(value * 100) / 100;

export function daysSince(instant: Date, now: Date) {
  return Math.max(0, Math.floor((now.getTime() - instant.getTime()) / DAY));
}

export function chargeStatus(charge: Charge, now: Date): ChargeStatus {
  const price = charge.priceUsd ?? 0;

  if (price <= 0) return charge.paidUsd > 0 ? "paid" : "unpriced";
  if (charge.paidUsd >= price - CENT) return "paid";
  if (charge.reviewUsd > 0) return "in_review";

  const ended = charge.status === "completed" || charge.endsAt <= now;
  if (charge.status === "no_show") return charge.paidUsd > 0 ? "partial" : "no_show";
  if (!ended) return "upcoming";
  if (daysSince(charge.endsAt, now) > OVERDUE_DAYS) return "overdue";
  return charge.paidUsd > 0 ? "partial" : "pending";
}

/** What is still missing once verified and in-review payments are counted. */
export function dueUsd(charge: Charge) {
  if (!charge.priceUsd) return 0;
  return Math.max(0, round2(charge.priceUsd - charge.paidUsd - charge.reviewUsd));
}

/** Session price: the one frozen at booking, else the patient's, else the therapist's. */
export function sessionPrice(
  appointment: string | null,
  patient: string | null,
  therapist: string | null,
) {
  const value = appointment ?? patient ?? therapist;
  return value === null ? null : Number(value);
}

export const agingBuckets = [
  { id: "d7", label: "0–7 días", max: 7 },
  { id: "d30", label: "8–30 días", max: 30 },
  { id: "d60", label: "31–60 días", max: 60 },
  { id: "older", label: "Más de 60 días", max: Number.POSITIVE_INFINITY },
] as const;

export function agingBucket(days: number) {
  return agingBuckets.find((bucket) => days <= bucket.max) ?? agingBuckets[3];
}

/** Methods whose money arrives in bolívares. */
export const VES_METHODS: ReadonlySet<string> = new Set([
  "pago_movil",
  "transferencia_bs",
  "efectivo_bs",
]);
