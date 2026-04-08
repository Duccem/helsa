import { ApplicationService } from "@/modules/shared/domain/service.";
import { BillingService } from "../domain/billing-service";

@ApplicationService()
export class InitializeNewOrganizationBilling {
  constructor(private billingService: BillingService) {}

  async execute(organization: { id: string; name: string; email: string }) {
    const customer = await this.billingService.createCustomer(organization);
    await this.billingService.createSubscription(customer.customerId, "free");
  }
}

