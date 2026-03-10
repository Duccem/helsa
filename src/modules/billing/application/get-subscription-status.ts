import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { BillingService } from "../domain/billing-service";

export class GetSubscriptionStatus {
  constructor(private readonly billingService: BillingService) {}

  async execute(organization?: { id: string }) {
    if (!organization) {
      throw new NotAuthorized();
    }

    const status = await this.billingService.getSubscriptionStatus(organization.id);

    return status;
  }
}

