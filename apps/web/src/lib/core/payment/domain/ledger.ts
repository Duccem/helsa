import { zonedDay, zonedTime } from "@/lib/utils/zoned-time";
import type { PaymentRepository } from "../adapters/payment-repository";
import { type ChargeStatus, chargeStatus, daysSince, dueUsd, sessionPrice } from "./billing";

export type ChargeRow = Awaited<ReturnType<PaymentRepository["getCharges"]>>[number];

export function patientName(row: { first_name: string; last_name: string }) {
  return `${row.first_name} ${row.last_name}`.trim();
}

export function shortName(row: { first_name: string; preferred_name: string | null }) {
  return row.preferred_name?.trim() || row.first_name;
}

/** One session as the payments page sees it. */
export function toSessionCharge(
  row: ChargeRow,
  context: { now: Date; timezone: string; defaultPriceUsd: string | null },
) {
  const priceUsd = sessionPrice(row.price_usd, row.patient_price_usd, context.defaultPriceUsd);
  const paidUsd = Number(row.paid_usd);
  const reviewUsd = Number(row.review_usd);
  const input = {
    status: row.status,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    priceUsd,
    paidUsd,
    reviewUsd,
  };
  const charge: ChargeStatus = chargeStatus(input, context.now);

  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: patientName(row),
    startsAt: row.starts_at.toISOString(),
    day: zonedDay(row.starts_at, context.timezone),
    time: zonedTime(row.starts_at, context.timezone),
    appointmentStatus: row.status,
    declaredMethod: row.declared_method,
    charge,
    priceUsd,
    paidUsd,
    reviewUsd,
    dueUsd: dueUsd(input),
    daysAgo: daysSince(row.ends_at, context.now),
    ended: row.status === "completed" || row.status === "no_show" || row.ends_at <= context.now,
    lastPaidAt: row.last_paid_at === null ? null : new Date(row.last_paid_at * 1000).toISOString(),
  };
}

export type SessionCharge = ReturnType<typeof toSessionCharge>;
