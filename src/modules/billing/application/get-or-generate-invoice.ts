import { BillingService } from "../domain/billing-service";

export class GetOrGenerateInvoice {
  constructor(private readonly service: BillingService) {}

  async execute(orderId: string) {
    const order = await this.service.getOrder(orderId);

    if (!order.isInvoiceGenerated) {
      return {
        state: "not_generated",
      };
    }

    try {
      const invoice = await this.service.getInvoice(orderId);

      return {
        state: "ready",
        url: invoice.url,
      };
    } catch (error) {
      return {
        state: "generating",
      };
    }
  }
}
