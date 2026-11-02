import type { BetterUser } from "@helsa/auth";
import { TherapistRepository } from "../../therapist/adapters/therapist-repository";
import { assertTherapistRole } from "../../therapist/domain/guards";
import { PaymentRepository } from "../adapters/payment-repository";
import { agingBucket, agingBuckets, OWED, round2 } from "../domain/billing";
import {
  type ChargeRow,
  patientName,
  type SessionCharge,
  shortName,
  toSessionCharge,
} from "../domain/ledger";

const DEFAULT_TIMEZONE = "America/Caracas";

type LoadPatientBalancesInput = {
  /** Only this patient; every patient when missing. */
  patientId?: string;
  now?: Date;
};

function emptyBalance(row: ChargeRow) {
  return {
    id: row.patient_id,
    name: patientName(row),
    shortName: shortName(row),
    phone: row.phone,
    email: row.email,
    whatsappOptIn: row.whatsapp_opt_in,
    owedUsd: 0,
    creditUsd: 0,
    reviewUsd: 0,
    noShowUsd: 0,
    sessions: [] as SessionCharge[],
    noShows: [] as SessionCharge[],
  };
}

type Balance = ReturnType<typeof emptyBalance>;

/**
 * What each patient owes today, across all time: sessions that already
 * happened and aren't paid, minus money left over as credit.
 */
export class LoadPatientBalances {
  private payments = new PaymentRepository();
  private therapists = new TherapistRepository();

  async execute(data: LoadPatientBalancesInput, user: BetterUser) {
    assertTherapistRole(user);
    const now = data.now ?? new Date();

    const [therapist, rows, credits, reminders] = await Promise.all([
      this.therapists.getById(user.id),
      this.payments.getCharges(user.id, { to: now, patient_id: data.patientId }),
      this.payments.getCredits(user.id, data.patientId),
      this.payments.getReminderStats(user.id),
    ]);

    const context = {
      now,
      timezone: therapist?.timezone ?? DEFAULT_TIMEZONE,
      defaultPriceUsd: therapist?.default_price_usd ?? null,
    };

    const byPatient = new Map<string, Balance>();
    const aging = agingBuckets.map((bucket) => ({ id: bucket.id, label: bucket.label, usd: 0, sessions: 0 }));

    for (const row of rows) {
      const session = toSessionCharge(row, context);
      const owes = OWED.has(session.charge);
      if (!owes && session.charge !== "no_show" && session.charge !== "in_review") continue;

      const balance = byPatient.get(row.patient_id) ?? emptyBalance(row);
      byPatient.set(row.patient_id, balance);

      if (session.charge === "no_show") {
        balance.noShowUsd = round2(balance.noShowUsd + session.dueUsd);
        balance.noShows.push(session);
        continue;
      }
      balance.reviewUsd = round2(balance.reviewUsd + session.reviewUsd);
      if (!owes) continue;

      balance.owedUsd = round2(balance.owedUsd + session.dueUsd);
      balance.sessions.push(session);
      const bucket = aging.find((item) => item.id === agingBucket(session.daysAgo).id);
      if (bucket) {
        bucket.usd = round2(bucket.usd + session.dueUsd);
        bucket.sessions += 1;
      }
    }

    for (const credit of credits) {
      const balance = byPatient.get(credit.patient_id);
      if (!balance) continue;
      const amount = Number(credit.amount_usd);
      if (credit.status === "verified") balance.creditUsd = round2(balance.creditUsd + amount);
      else balance.reviewUsd = round2(balance.reviewUsd + amount);
    }

    const stats = new Map(reminders.map((item) => [item.patient_id, item]));

    const patients = [...byPatient.values()]
      .map((balance) => {
        const reminder = stats.get(balance.id);
        return {
          ...balance,
          balanceUsd: Math.max(0, round2(balance.owedUsd - balance.creditUsd)),
          oldestDay: balance.sessions[0]?.day ?? null,
          oldestDaysAgo: balance.sessions[0]?.daysAgo ?? 0,
          reminders: reminder?.count ?? 0,
          lastReminder: reminder
            ? {
                sentAt: new Date(reminder.last_sent_at * 1000).toISOString(),
                channel: reminder.last_channel as "whatsapp" | "email",
              }
            : null,
        };
      })
      .sort((a, b) => b.balanceUsd - a.balanceUsd || b.oldestDaysAgo - a.oldestDaysAgo);

    return {
      timezone: context.timezone,
      patients,
      aging,
      owedUsd: round2(patients.reduce((sum, item) => sum + item.balanceUsd, 0)),
      noShowUsd: round2(patients.reduce((sum, item) => sum + item.noShowUsd, 0)),
    };
  }
}

export type PatientBalances = Awaited<ReturnType<LoadPatientBalances["execute"]>>;
export type PatientBalance = PatientBalances["patients"][number];
