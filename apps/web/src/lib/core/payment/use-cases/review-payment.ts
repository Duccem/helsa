import type { BetterUser } from "@helsa/auth";
import { isUuid } from "@/lib/utils/is-uuid";
import { assertTherapistRole } from "../../therapist/domain/guards";
import { PaymentRepository } from "../adapters/payment-repository";
import { PaymentAlreadyReviewed, PaymentNotFound } from "../domain/errors";
import type { SessionPayment } from "../domain/types";

type ReviewPaymentInput = {
  paymentId: string;
} & ({ decision: "verify" } | { decision: "reject"; reason: string });

/**
 * The therapist checked the payment against their bank or wallet. Verified
 * payments count as collected; rejected ones stay on record with the reason.
 */
export class ReviewPayment {
  private repository = new PaymentRepository();

  async execute(data: ReviewPaymentInput, user: BetterUser) {
    assertTherapistRole(user);

    if (!isUuid(data.paymentId)) {
      throw new PaymentNotFound();
    }

    const payment = await this.repository.getById(data.paymentId, user.id);

    if (!payment) {
      throw new PaymentNotFound();
    }

    const target = data.decision === "verify" ? "verified" : "rejected";
    if (payment.status === target) {
      throw new PaymentAlreadyReviewed();
    }

    await this.repository.update(this.review(data, payment, user.id));
  }

  private review(data: ReviewPaymentInput, payment: SessionPayment, user_id: string): SessionPayment {
    const now = new Date();
    if (data.decision === "verify") {
      return {
        ...payment,
        status: "verified",
        verified_at: now,
        verified_by: user_id,
        rejected_at: null,
        rejection_reason: null,
      };
    }
    return {
      ...payment,
      status: "rejected",
      rejected_at: now,
      rejection_reason: data.reason,
      verified_at: null,
      verified_by: null,
    };
  }
}
