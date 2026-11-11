import type { BetterUser } from "@helsa/auth";
import { zonedDay } from "@/lib/utils/zoned-time";
import { FileRepository } from "../../file/adapters/file-repository";
import { EnsurePatientAccess } from "../../patient/use-cases/ensure-patient-access";
import { TherapistRepository } from "../../therapist/adapters/therapist-repository";
import { PaymentRepository } from "../adapters/payment-repository";
import { paidAtFor, splitPayment } from "../domain/allocation";
import { PaymentInFuture, PaymentProofMismatch, PaymentSessionMismatch } from "../domain/errors";
import { toSessionCharge } from "../domain/ledger";
import type { NewSessionPayment, PaymentMethod } from "../domain/types";

const DEFAULT_TIMEZONE = "America/Caracas";

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
      paid_at: paidAtFor(data.paidOn, now, timezone),
      proof_file_id: data.proofFileId,
      reported_by: "therapist",
      status: data.verified ? "verified" : "pending_review",
      verified_at: data.verified ? now : null,
      verified_by: data.verified ? user.id : null,
    };

    const rows = splitPayment(data, sessions).map((part) => ({ ...base, ...part }));
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
}
