import { BillingService } from "../domain/billing-service";

export class GetOrderList {
  constructor(private readonly service: BillingService) {}

  async execute(organizationId: string, page: number = 1) {
    return this.service.getOrders(organizationId, page);
  }
}

