import type { PaymentRepository } from "../adapters/payment-repository";
import { OWED, round2 } from "./billing";
import { type ChargeRow, toSessionCharge } from "./ledger";

type Credits = Awaited<ReturnType<PaymentRepository["getCredits"]>>;

/**
 * What one patient owes today, counted the same way as the therapist's
 * payments page: unpaid sessions that already happened, minus money left
 * over as credit. `charges` must be that patient's sessions up to `now`.
 */
export function patientBalance(
  charges: ChargeRow[],
  credits: Credits,
  context: { now: Date; timezone: string; defaultPriceUsd: string | null },
) {
  const sessions = charges
    .map((row) => toSessionCharge(row, context))
    .filter((session) => OWED.has(session.charge) || session.charge === "in_review");

  const owed = sessions.filter((session) => OWED.has(session.charge));
  const owedUsd = round2(owed.reduce((sum, session) => sum + session.dueUsd, 0));
  let creditUsd = 0;
  let reviewUsd = round2(sessions.reduce((sum, session) => sum + session.reviewUsd, 0));
  for (const credit of credits) {
    if (credit.status === "verified") creditUsd = round2(creditUsd + Number(credit.amount_usd));
    else reviewUsd = round2(reviewUsd + Number(credit.amount_usd));
  }

  return {
    owedUsd: Math.max(0, round2(owedUsd - creditUsd)),
    reviewUsd,
    creditUsd: Math.max(0, round2(creditUsd - owedUsd)),
    /** Oldest first. */
    sessions: owed.map((session) => ({
      id: session.id,
      day: session.day,
      time: session.time,
      priceUsd: session.priceUsd ?? 0,
      paidUsd: session.paidUsd,
      dueUsd: session.dueUsd,
      daysAgo: session.daysAgo,
      overdue: session.charge === "overdue",
    })),
  };
}

export type PatientBalanceSummary = ReturnType<typeof patientBalance>;
