import { ApplicationService } from "@/modules/shared/domain/service.";
import { BillingService } from "../domain/billing-service";

@ApplicationService()
export class GetOrderList {
  constructor(private readonly service: BillingService) {}

  async execute(customerId: string, page: number = 1) {
    return this.service.getOrders(customerId, page);
  }
}

