import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { BillingService } from "../domain/billing-service";

export class GetSubscriptionStatus {
  constructor(private readonly billingService: BillingService) {}

  async execute(customer?: { id: string }) {
    if (!customer) {
      throw new NotAuthorized();
    }

    const status = await this.billingService.getSubscriptionStatus(customer.id);

    return status;
  }
}

