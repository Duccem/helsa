import type { BetterUser } from "@helsa/auth";
import { zonedDay } from "@/lib/utils/zoned-time";
import { EnsurePortalPatient } from "../../patient/use-cases/ensure-portal-patient";
import { TherapistRepository } from "../../therapist/adapters/therapist-repository";
import { PaymentRepository } from "../adapters/payment-repository";
import { patientBalance } from "../domain/patient-balance";

/** The patient's payments page: what they owe, how to pay and what they already sent. */
export class LoadPatientPayments {
  private portal = new EnsurePortalPatient();
  private therapists = new TherapistRepository();
  private payments = new PaymentRepository();

  async execute(user: BetterUser, now = new Date()) {
    const patient = await this.portal.execute(user);
    const therapist_id = patient.therapist_id;
    const timezone = patient.timezone;

    const [therapist, charges, credits, history, rate] = await Promise.all([
      this.therapists.getById(therapist_id),
      this.payments.getCharges(therapist_id, { to: now, patient_id: patient.id }),
      this.payments.getCredits(therapist_id, patient.id),
      this.payments.listPayments(therapist_id, { patient_id: patient.id }),
      this.payments.getReferenceRate(therapist_id),
    ]);

    return {
      today: zonedDay(now, timezone),
      timezone,
      therapist: therapist?.display_name ?? "Tu terapeuta",
      balance: patientBalance(charges, credits, {
        now,
        timezone,
        defaultPriceUsd: therapist?.default_price_usd ?? null,
      }),
      payWith: {
        methods: therapist?.payment_methods ?? [],
        instructions: therapist?.payment_instructions?.trim() || null,
      },
      rate,
      payments: history.map((row) => ({
        id: row.payment.id,
        usd: Number(row.payment.amount_usd),
        ves: row.payment.amount_ves === null ? null : Number(row.payment.amount_ves),
        method: row.payment.method,
        status: row.payment.status,
        reportedBy: row.payment.reported_by,
        reference: row.payment.reference,
        day: zonedDay(row.payment.paid_at, timezone),
        sessionDay: row.session_starts_at ? zonedDay(row.session_starts_at, timezone) : null,
        rejectionReason: row.payment.rejection_reason,
        hasProof: row.payment.proof_file_id !== null,
      })),
    };
  }
}

export type PatientPayments = Awaited<ReturnType<LoadPatientPayments["execute"]>>;
export type PortalPayment = PatientPayments["payments"][number];
