import { BillingService } from "../domain/billing-service";

export class InitializeNewUserBilling {
  constructor(private billingService: BillingService) {}

  async execute(payload: { id: string; name: string; email: string }) {
    await this.billingService.createCustomer(payload);
  }
}

