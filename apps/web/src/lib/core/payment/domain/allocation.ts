import { addDays, startOfZonedDay, zonedDay } from "@/lib/utils/zoned-time";
import { round2 } from "./billing";

const NOON = 12 * 3_600_000;

export type PaymentAmount = {
  currency: "usd" | "ves";
  amountUsd: number | null;
  amountVes: number | null;
  vesPerUsd: number | null;
  paidOn: string;
};

/** A past day is stored at noon so it never slips into the day before. */
export function paidAtFor(day: string, now: Date, timezone: string) {
  if (day === zonedDay(now, timezone)) return now;
  const start = startOfZonedDay(day, timezone);
  const end = startOfZonedDay(addDays(day, 1), timezone);
  return new Date(Math.min(start.getTime() + NOON, end.getTime() - 1));
}

/**
 * Splits one payment across sessions in the order given (oldest first);
 * whatever is left stays as a deposit with no session.
 */
export function splitPayment(data: PaymentAmount, sessions: Array<{ id: string; dueUsd: number }>) {
  const inVes = data.currency === "ves";
  const rate = inVes ? (data.vesPerUsd ?? 0) : null;
  const totalUsd = inVes ? round2((data.amountVes ?? 0) / (rate || 1)) : round2(data.amountUsd ?? 0);
  const totalVes = inVes ? (data.amountVes ?? 0) : null;

  const parts: Array<{ appointment_id: string | null; usd: number }> = [];
  let left = totalUsd;
  for (const session of sessions) {
    if (left <= 0) break;
    const usd = round2(Math.min(left, session.dueUsd));
    if (usd <= 0) continue;
    parts.push({ appointment_id: session.id, usd });
    left = round2(left - usd);
  }
  if (left > 0) parts.push({ appointment_id: null, usd: left });

  // Bolívares follow the dollars; the last part takes the rounding.
  let vesLeft = totalVes ?? 0;
  return parts.map((part, index) => {
    const ves =
      totalVes === null
        ? null
        : index === parts.length - 1
          ? round2(vesLeft)
          : round2((part.usd / totalUsd) * totalVes);
    if (ves !== null) vesLeft = round2(vesLeft - ves);
    return {
      appointment_id: part.appointment_id,
      amount_usd: part.usd.toFixed(2),
      amount_ves: ves === null ? null : ves.toFixed(2),
      ves_per_usd: rate === null ? null : rate.toFixed(4),
      rate_date: rate === null ? null : data.paidOn,
    };
  });
}
