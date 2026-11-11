import { randomUUID } from "node:crypto";
import type { BetterUser } from "@helsa/auth";
import { validateFile } from "@/components/dashboard/patients/schema";
import { CURRENT_KEY_VERSION, encrypt, sha256 } from "@/lib/infra/clinical-cipher";
import { putObject, removeObject } from "@/lib/infra/file-storage";
import { zonedDay } from "@/lib/utils/zoned-time";
import { FileRepository } from "../../file/adapters/file-repository";
import { FileRejected } from "../../file/domain/errors";
import { EnsurePortalPatient } from "../../patient/use-cases/ensure-portal-patient";
import { TherapistRepository } from "../../therapist/adapters/therapist-repository";
import { PaymentRepository } from "../adapters/payment-repository";
import { type PaymentAmount, paidAtFor, splitPayment } from "../domain/allocation";
import { PaymentInFuture, PaymentSessionMismatch } from "../domain/errors";
import { toSessionCharge } from "../domain/ledger";
import type { NewSessionPayment, PaymentMethod } from "../domain/types";

/** Receipts are screenshots or PDFs. */
const PROOF_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic"]);

type ReportPaymentInput = PaymentAmount & {
  /** Sessions it pays; the oldest gets paid first. Empty = a deposit. */
  sessionIds: string[];
  method: PaymentMethod;
  reference: string | null;
  note: string | null;
  proof: { name: string; type: string; bytes: Buffer } | null;
};

/**
 * The patient tells their therapist they sent money. It is stored like any
 * other payment, but waits for the therapist to check it before it counts.
 */
export class ReportPayment {
  private portal = new EnsurePortalPatient();
  private therapists = new TherapistRepository();
  private payments = new PaymentRepository();
  private files = new FileRepository();

  async execute(data: ReportPaymentInput, user: BetterUser) {
    const patient = await this.portal.execute(user);
    const therapist_id = patient.therapist_id;
    const now = new Date();

    if (data.paidOn > zonedDay(now, patient.timezone)) {
      throw new PaymentInFuture();
    }
    if (data.proof) {
      const problem = PROOF_TYPES.has(data.proof.type)
        ? validateFile({ type: data.proof.type, size: data.proof.bytes.length })
        : "Sube una imagen o un PDF del comprobante.";
      if (problem) throw new FileRejected(problem);
    }

    const therapist = await this.therapists.getById(therapist_id);
    const sessions = await this.selectedSessions(data.sessionIds, therapist_id, patient.id, {
      now,
      timezone: patient.timezone,
      defaultPriceUsd: therapist?.default_price_usd ?? null,
    });

    const proofFileId = data.proof ? await this.storeProof(data.proof, therapist_id, patient.id, user.id) : null;

    const base: Omit<NewSessionPayment, "amount_usd"> = {
      therapist_id,
      patient_id: patient.id,
      method: data.method,
      reference: data.reference,
      note: data.note,
      paid_at: paidAtFor(data.paidOn, now, patient.timezone),
      proof_file_id: proofFileId,
      reported_by: "patient",
      status: "pending_review",
    };

    const rows = splitPayment(data, sessions).map((part) => ({ ...base, ...part }));
    await this.payments.createMany(rows);

    return { count: rows.length };
  }

  /** Only sessions that still owe something can be paid, oldest first. */
  private async selectedSessions(
    ids: string[],
    therapist_id: string,
    patient_id: string,
    context: Parameters<typeof toSessionCharge>[1],
  ) {
    if (ids.length === 0) return [];
    const wanted = new Set(ids);
    const rows = await this.payments.getCharges(therapist_id, { patient_id });
    const sessions = rows
      .filter((row) => wanted.has(row.id))
      .map((row) => toSessionCharge(row, context))
      .filter((session) => session.dueUsd > 0);

    if (sessions.length !== wanted.size) {
      throw new PaymentSessionMismatch();
    }
    return sessions;
  }

  private async storeProof(
    proof: NonNullable<ReportPaymentInput["proof"]>,
    therapist_id: string,
    patient_id: string,
    user_id: string,
  ) {
    const id = randomUUID();
    const storage_key = `${therapist_id}/${patient_id}/${id}`;
    await putObject(storage_key, encrypt(proof.bytes, therapist_id));

    try {
      await this.files.create({
        id,
        therapist_id,
        patient_id,
        uploaded_by: user_id,
        storage_key,
        original_name: cleanName(proof.name),
        mime_type: proof.type,
        size_bytes: proof.bytes.length,
        sha256: sha256(proof.bytes),
        is_encrypted: true,
        enc_key_version: CURRENT_KEY_VERSION,
      });
    } catch (error) {
      // Don't leave an orphan object behind when the row could not be saved.
      await removeObject(storage_key).catch(() => undefined);
      throw error;
    }
    return id;
  }
}

function cleanName(name: string) {
  const clean = name.replace(/[\/\u0000-\u001f]/g, "_").trim();
  return (clean || "comprobante").slice(0, 200);
}
