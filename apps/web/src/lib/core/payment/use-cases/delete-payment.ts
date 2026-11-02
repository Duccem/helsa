import type { BetterUser } from "@helsa/auth";
import { isUuid } from "@/lib/utils/is-uuid";
import { assertTherapistRole } from "../../therapist/domain/guards";
import { PaymentRepository } from "../adapters/payment-repository";
import { PaymentNotFound } from "../domain/errors";

/** Removes a payment recorded by mistake. Soft delete: the row stays for audit. */
export class DeletePayment {
  private repository = new PaymentRepository();

  async execute(data: { paymentId: string }, user: BetterUser) {
    assertTherapistRole(user);

    if (!isUuid(data.paymentId)) {
      throw new PaymentNotFound();
    }

    const payment = await this.repository.getById(data.paymentId, user.id);

    if (!payment) {
      throw new PaymentNotFound();
    }

    await this.repository.update({ ...payment, deleted_at: new Date() });
  }
}
