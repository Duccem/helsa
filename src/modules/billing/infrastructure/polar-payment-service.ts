import { BillingService } from "../domain/billing-service";
import { polar } from "./polar-client";
import { products } from "./polar-products";

export class PolarPaymentService implements BillingService {
  async createCustomer(organization: { id: string; name: string }): Promise<{ customerId: string }> {
    const customer = await polar.customers.create({
      externalId: organization.id,
      email: `${organization.name.split(" ")[0]}@email.com`,
      name: organization.name,
    });

    return { customerId: customer.id };
  }

  async createSubscription(customerId: string, planId: string): Promise<{ subscriptionId: string }> {
    const product = products.find((p) => p.id === planId);
    if (!product) {
      throw new Error("Invalid plan ID");
    }
    const subscription = await polar.subscriptions.create({
      externalCustomerId: customerId,
      productId: product.productId,
    });
    return { subscriptionId: subscription.id };
  }
}

