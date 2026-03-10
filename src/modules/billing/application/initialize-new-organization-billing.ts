import { BillingService } from "../domain/billing-service";

export class InitializeNewOrganizationBilling {
  constructor(private billingService: BillingService) {}

  async execute(organization: { id: string; name: string }) {
    const customer = await this.billingService.createCustomer(organization);
    await this.billingService.createSubscription(customer.customerId, "free");
  }
}

