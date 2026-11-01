import { and, desc, eq, isNull } from "@helsa/db/operators";
import { session_payment } from "@helsa/db/schema/payment";
import { db } from "@/services";

export class PaymentRepository {
  async listByPatient(patient_id: string, therapist_id: string) {
    return db
      .select()
      .from(session_payment)
      .where(
        and(
          eq(session_payment.patient_id, patient_id),
          eq(session_payment.therapist_id, therapist_id),
          isNull(session_payment.deleted_at),
        ),
      )
      .orderBy(desc(session_payment.paid_at));
  }
}
