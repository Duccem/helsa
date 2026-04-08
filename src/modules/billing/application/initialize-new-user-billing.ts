import { ApplicationService } from "@/modules/shared/domain/service.";
import { BillingService } from "../domain/billing-service";

@ApplicationService()
export class InitializeNewUserBilling {
  constructor(private billingService: BillingService) {}

  async execute(payload: { id: string; name: string; email: string }) {
    await this.billingService.createCustomer(payload);
  }
}

