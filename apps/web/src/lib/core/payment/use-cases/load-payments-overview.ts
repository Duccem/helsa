import type { BetterUser } from "@helsa/auth";
import { type DateRange, previousRange, resolveRange } from "@/lib/utils/date-range";
import { addDays, startOfZonedDay, zonedDay } from "@/lib/utils/zoned-time";
import { PatientRepository } from "../../patient/adapters/patient-repository";
import { LoadPreferences } from "../../settings/use-cases/load-preferences";
import { TherapistRepository } from "../../therapist/adapters/therapist-repository";
import { assertTherapistRole } from "../../therapist/domain/guards";
import { PaymentRepository } from "../adapters/payment-repository";
import { type ChargeStatus, chargeStatuses, round2, VES_METHODS } from "../domain/billing";
import { patientName, type SessionCharge, toSessionCharge } from "../domain/ledger";
import type { PaymentMethod } from "../domain/types";
import { LoadPatientBalances } from "./load-patient-balances";

const DEFAULT_TIMEZONE = "America/Caracas";
const DAY = 86_400_000;

type LoadPaymentsOverviewInput = {
  preset?: string;
  from?: string;
  to?: string;
  now?: Date;
};

type PaymentRow = Awaited<ReturnType<PaymentRepository["listPayments"]>>[number];

function toPayment(row: PaymentRow, timezone: string) {
  const { payment } = row;
  return {
    id: payment.id,
    patientId: payment.patient_id,
    patientName: patientName(row),
    paidAt: payment.paid_at.toISOString(),
    day: zonedDay(payment.paid_at, timezone),
    method: payment.method,
    amountUsd: Number(payment.amount_usd),
    amountVes: payment.amount_ves === null ? null : Number(payment.amount_ves),
    vesPerUsd: payment.ves_per_usd === null ? null : Number(payment.ves_per_usd),
    reference: payment.reference,
    note: payment.note,
    status: payment.status,
    reportedBy: payment.reported_by,
    rejectionReason: payment.rejection_reason,
    verifiedAt: payment.verified_at?.toISOString() ?? null,
    sessionDay: row.session_starts_at ? zonedDay(row.session_starts_at, timezone) : null,
    sessionCancelled: row.session_status === "cancelled",
    proof:
      payment.proof_file_id && row.proof_name
        ? { id: payment.proof_file_id, name: row.proof_name, mimeType: row.proof_mime ?? "" }
        : null,
  };
}

type Payment = ReturnType<typeof toPayment>;

/** Everything the payments page shows for one period. */
export class LoadPaymentsOverview {
  private payments = new PaymentRepository();
  private patients = new PatientRepository();
  private therapists = new TherapistRepository();
  private preferences = new LoadPreferences();
  private balances = new LoadPatientBalances();

  async execute(data: LoadPaymentsOverviewInput, user: BetterUser) {
    assertTherapistRole(user);
    const now = data.now ?? new Date();

    const [therapist, preferences, rate, balances, patients, queue] = await Promise.all([
      this.therapists.getById(user.id),
      this.preferences.execute(user.id),
      this.payments.getReferenceRate(user.id),
      this.balances.execute({ now }, user),
      this.patients.list(user.id),
      this.payments.listPayments(user.id, { statuses: ["pending_review"] }),
    ]);

    const timezone = therapist?.timezone ?? DEFAULT_TIMEZONE;
    const today = zonedDay(now, timezone);
    const range = resolveRange(data, today);
    const previous = previousRange(range);
    const span = (period: DateRange) => ({
      from: startOfZonedDay(period.from, timezone),
      to: startOfZonedDay(addDays(period.to, 1), timezone),
    });

    const [rows, previousRows, paymentRows, previousPayments] = await Promise.all([
      this.payments.getCharges(user.id, span(range)),
      this.payments.getCharges(user.id, span(previous)),
      this.payments.listPayments(user.id, span(range)),
      this.payments.listPayments(user.id, { ...span(previous), statuses: ["verified"] }),
    ]);

    const context = { now, timezone, defaultPriceUsd: therapist?.default_price_usd ?? null };
    const sessions = rows.map((row) => toSessionCharge(row, context));
    const previousSessions = previousRows.map((row) => toSessionCharge(row, context));
    const payments = paymentRows.map((row) => toPayment(row, timezone));
    const verified = payments.filter((item) => item.status === "verified");
    const vesPerUsd = rate?.vesPerUsd ?? null;

    const collectedUsd = this.sum(verified, (item) => item.amountUsd);
    const billing = this.billing(sessions);
    const previousBilling = this.billing(previousSessions);
    const inVes = verified.filter((item) => VES_METHODS.has(item.method));

    return {
      today,
      timezone,
      nowIso: now.toISOString(),
      currencyDisplay: preferences.currencyDisplay as "usd" | "ves" | "both",
      period: { ...range, granularity: this.granularity(range.days) },
      previousPeriod: previous,
      rate,
      therapist: {
        name: therapist?.display_name ?? user.name,
        paymentInstructions: therapist?.payment_instructions ?? null,
        paymentMethods: (therapist?.payment_methods ?? []) as PaymentMethod[],
        hasDefaultPrice: therapist?.default_price_usd != null,
      },
      summary: {
        collectedUsd,
        // Bolívares actually received, plus dollars converted at the reference rate.
        collectedVes:
          vesPerUsd === null && verified.some((item) => item.amountVes === null)
            ? null
            : round2(this.sum(verified, (item) => item.amountVes ?? item.amountUsd * (vesPerUsd ?? 0))),
        receivedVes: this.sum(inVes, (item) => item.amountVes ?? 0),
        receivedVesAsUsd: this.sum(inVes, (item) => item.amountUsd),
        receivedForeignUsd: round2(collectedUsd - this.sum(inVes, (item) => item.amountUsd)),
        paymentsCount: verified.length,
        ...billing,
        expectedUsd: this.sum(
          sessions.filter((item) => item.charge === "upcoming"),
          (item) => item.dueUsd,
        ),
        owedUsd: balances.owedUsd,
        overdueUsd: this.sum(
          balances.patients.flatMap((item) => item.sessions).filter((item) => item.charge === "overdue"),
          (item) => item.dueUsd,
        ),
        inReviewUsd: this.sum(queue, (row) => Number(row.payment.amount_usd)),
        inReviewCount: queue.length,
        previous: {
          collectedUsd: this.sum(previousPayments, (row) => Number(row.payment.amount_usd)),
          billedUsd: previousBilling.billedUsd,
          attended: previousBilling.attended,
        },
      },
      statuses: this.byStatus(sessions),
      methods: this.byMethod(verified),
      trend: this.trend(verified, range),
      topPatients: this.topPatients(verified, collectedUsd),
      balances,
      reviewQueue: queue.map((row) => toPayment(row, timezone)),
      sessions: [...sessions].reverse(),
      payments,
      patients: patients
        .filter((item) => item.status !== "discharged" || balances.patients.some((b) => b.id === item.id))
        .map((item) => ({ id: item.id, name: patientName(item) })),
      openSessions: this.openSessions(sessions, balances.patients.flatMap((item) => [...item.sessions, ...item.noShows])),
    };
  }

  private sum<T>(items: T[], pick: (item: T) => number) {
    return round2(items.reduce((total, item) => total + pick(item), 0));
  }

  /** Sessions that already happened (no-shows aside) and what came in for them. */
  private billing(sessions: SessionCharge[]) {
    const attended = sessions.filter(
      (item) => item.ended && item.appointmentStatus !== "no_show" && item.priceUsd,
    );
    const billedUsd = this.sum(attended, (item) => item.priceUsd ?? 0);
    const collectedForBilled = this.sum(attended, (item) => Math.min(item.paidUsd, item.priceUsd ?? 0));
    const paidLags = attended
      .filter((item) => item.charge === "paid" && item.lastPaidAt)
      .map((item) => Math.max(0, (Date.parse(item.lastPaidAt ?? "") - Date.parse(item.startsAt)) / DAY));

    return {
      attended: attended.length,
      billedUsd,
      collectionRate: billedUsd > 0 ? collectedForBilled / billedUsd : null,
      averageSessionUsd: attended.length ? round2(billedUsd / attended.length) : null,
      averageDaysToPay: paidLags.length
        ? Math.round((paidLags.reduce((a, b) => a + b, 0) / paidLags.length) * 10) / 10
        : null,
      noShows: sessions.filter((item) => item.appointmentStatus === "no_show").length,
      unpriced: sessions.filter((item) => item.charge === "unpriced").length,
    };
  }

  private byStatus(sessions: SessionCharge[]) {
    return chargeStatuses.map((status) => {
      const own = sessions.filter((item) => item.charge === status);
      return {
        status,
        count: own.length,
        // What the status is about: money in for "paid", money missing otherwise.
        amountUsd: this.sum(own, (item) => this.statusAmount(item, status)),
      };
    });
  }

  private statusAmount(item: SessionCharge, status: ChargeStatus) {
    if (status === "paid") return item.paidUsd;
    if (status === "in_review") return item.reviewUsd;
    return item.dueUsd;
  }

  private byMethod(payments: Payment[]) {
    const groups = new Map<PaymentMethod, { method: PaymentMethod; usd: number; ves: number; count: number }>();
    for (const item of payments) {
      const group = groups.get(item.method) ?? { method: item.method, usd: 0, ves: 0, count: 0 };
      group.usd = round2(group.usd + item.amountUsd);
      group.ves = round2(group.ves + (item.amountVes ?? 0));
      group.count += 1;
      groups.set(item.method, group);
    }
    return [...groups.values()].sort((a, b) => b.usd - a.usd);
  }

  private granularity(days: number) {
    if (days <= 45) return "day" as const;
    if (days <= 190) return "week" as const;
    return "month" as const;
  }

  /** Collected money per day, week (from Monday) or month across the whole range. */
  private trend(payments: Payment[], range: DateRange) {
    const granularity = this.granularity(range.days);
    const keyOf = (day: string) => {
      if (granularity === "month") return `${day.slice(0, 7)}-01`;
      if (granularity === "day") return day;
      const weekday = (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7;
      return addDays(day, -weekday);
    };

    const buckets = new Map<string, { key: string; usd: number; count: number }>();
    for (let day = range.from; day <= range.to; day = addDays(day, 1)) {
      const key = keyOf(day);
      if (!buckets.has(key)) buckets.set(key, { key, usd: 0, count: 0 });
    }
    for (const item of payments) {
      const bucket = buckets.get(keyOf(item.day));
      if (!bucket) continue;
      bucket.usd = round2(bucket.usd + item.amountUsd);
      bucket.count += 1;
    }
    return [...buckets.values()];
  }

  private topPatients(payments: Payment[], total: number) {
    const groups = new Map<string, { id: string; name: string; usd: number; count: number }>();
    for (const item of payments) {
      const group = groups.get(item.patientId) ?? { id: item.patientId, name: item.patientName, usd: 0, count: 0 };
      group.usd = round2(group.usd + item.amountUsd);
      group.count += 1;
      groups.set(item.patientId, group);
    }
    return [...groups.values()]
      .sort((a, b) => b.usd - a.usd)
      .slice(0, 5)
      .map((item) => ({ ...item, share: total > 0 ? item.usd / total : 0 }));
  }

  /** Sessions a new payment can be applied to: anything not fully paid. */
  private openSessions(...lists: SessionCharge[][]) {
    const seen = new Map<string, SessionCharge>();
    for (const item of lists.flat()) {
      if (item.dueUsd > 0 && !seen.has(item.id)) seen.set(item.id, item);
    }
    return [...seen.values()]
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map((item) => ({
        id: item.id,
        patientId: item.patientId,
        day: item.day,
        time: item.time,
        dueUsd: item.dueUsd,
        charge: item.charge,
      }));
  }
}

export type PaymentsOverview = Awaited<ReturnType<LoadPaymentsOverview["execute"]>>;
export type OverviewPayment = PaymentsOverview["payments"][number];
export type OverviewSession = PaymentsOverview["sessions"][number];
export type OpenSession = PaymentsOverview["openSessions"][number];
