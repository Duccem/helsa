import type { BetterUser } from "@helsa/auth";
import { addDays, startOfZonedDay, zonedDay } from "@/lib/utils/zoned-time";
import { FileRepository } from "../../file/adapters/file-repository";
import { EnsurePatientAccess } from "../../patient/use-cases/ensure-patient-access";
import { TherapistRepository } from "../../therapist/adapters/therapist-repository";
import { PaymentRepository } from "../adapters/payment-repository";
import { round2 } from "../domain/billing";
import { PaymentInFuture, PaymentProofMismatch, PaymentSessionMismatch } from "../domain/errors";
import { type SessionCharge, toSessionCharge } from "../domain/ledger";
import type { NewSessionPayment, PaymentMethod } from "../domain/types";

const DEFAULT_TIMEZONE = "America/Caracas";
const NOON = 12 * 3_600_000;

type RecordPaymentInput = {
  patientId: string;
  /** Sessions it pays, oldest first gets paid first. Empty = a deposit. */
  sessionIds: string[];
  method: PaymentMethod;
  currency: "usd" | "ves";
  amountUsd: number | null;
  amountVes: number | null;
  vesPerUsd: number | null;
  paidOn: string;
  reference: string | null;
  note: string | null;
  proofFileId: string | null;
  verified: boolean;
};

/**
 * Records money the patient sent. One payment can cover several sessions: it
 * is split across them in date order and whatever is left stays as a deposit.
 */
export class RecordPayment {
  private payments = new PaymentRepository();
  private files = new FileRepository();
  private therapists = new TherapistRepository();
  private access = new EnsurePatientAccess();

  async execute(data: RecordPaymentInput, user: BetterUser) {
    const patient = await this.access.execute(data.patientId, user);
    const therapist = await this.therapists.getById(user.id);
    const timezone = therapist?.timezone ?? DEFAULT_TIMEZONE;
    const now = new Date();

    if (data.paidOn > zonedDay(now, timezone)) {
      throw new PaymentInFuture();
    }

    if (data.proofFileId) {
      const proof = await this.files.getById(data.proofFileId, patient.id, user.id);
      if (!proof) throw new PaymentProofMismatch();
    }

    const sessions = await this.selectedSessions(data, user.id, {
      now,
      timezone,
      defaultPriceUsd: therapist?.default_price_usd ?? null,
    });

    const base: Omit<NewSessionPayment, "amount_usd"> = {
      therapist_id: user.id,
      patient_id: patient.id,
      method: data.method,
      reference: data.reference,
      note: data.note,
      paid_at: this.paidAt(data.paidOn, now, timezone),
      proof_file_id: data.proofFileId,
      reported_by: "therapist",
      status: data.verified ? "verified" : "pending_review",
      verified_at: data.verified ? now : null,
      verified_by: data.verified ? user.id : null,
    };

    const rows = this.split(data, sessions).map((part) => ({ ...base, ...part }));
    await this.payments.createMany(rows);

    return { count: rows.length };
  }

  private async selectedSessions(
    data: RecordPaymentInput,
    therapist_id: string,
    context: Parameters<typeof toSessionCharge>[1],
  ) {
    if (data.sessionIds.length === 0) return [];
    const wanted = new Set(data.sessionIds);
    const rows = await this.payments.getCharges(therapist_id, { patient_id: data.patientId });
    const sessions = rows.filter((row) => wanted.has(row.id)).map((row) => toSessionCharge(row, context));

    if (sessions.length !== wanted.size) {
      throw new PaymentSessionMismatch();
    }
    return sessions;
  }

  /** A past day is stored at noon so it never slips into the day before. */
  private paidAt(day: string, now: Date, timezone: string) {
    if (day === zonedDay(now, timezone)) return now;
    const start = startOfZonedDay(day, timezone);
    const end = startOfZonedDay(addDays(day, 1), timezone);
    return new Date(Math.min(start.getTime() + NOON, end.getTime() - 1));
  }

  private split(data: RecordPaymentInput, sessions: SessionCharge[]) {
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
}
