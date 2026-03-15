import {
  BillingService,
  Customer,
  Order,
  OrderInvoice,
  OrdersResponse,
  OrganizationCustomer,
  Subscription,
  SubscriptionStatus,
} from "../domain/billing-service";
import { polar } from "./polar-client";
import { medicalProducts } from "./polar-products";

export class PolarBillingService implements BillingService {
  async createCustomer(organization: OrganizationCustomer): Promise<Customer> {
    const customer = await polar.customers.create({
      externalId: organization.id,
      email: `${organization.name.split(" ")[0]}@email.com`,
      name: organization.name,
      metadata: {
        user_id: organization.id,
      },
    });

    return { customerId: customer.id };
  }

  async createSubscription(customerId: string, planId: string): Promise<Subscription> {
    const product = medicalProducts.find((p) => p.id === planId);
    if (!product) {
      throw new Error("Invalid plan ID");
    }
    const subscription = await polar.subscriptions.create({
      externalCustomerId: customerId,
      productId: product.productId,
      metadata: {
        user_id: customerId,
      },
    });
    return { subscriptionId: subscription.id };
  }

  async getSubscriptionStatus(externalCustomerId: string): Promise<SubscriptionStatus> {
    const state = await polar.customers.getStateExternal({ externalId: externalCustomerId });

    return {
      id: state.id,
      externalId: externalCustomerId,
      activeSubscriptions: state.activeSubscriptions.map((sub) => ({
        id: sub.id,
        productId: sub.productId,
      })),
    };
  }

  async getOrders(externalCustomerId: string, page: number): Promise<OrdersResponse> {
    const ordersResponse = await polar.orders.list({
      externalCustomerId,
      page,
      limit: 10,
    });

    return {
      items: ordersResponse.result.items,
      pagination: ordersResponse.result.pagination,
    };
  }

  async getOrder(orderId: string): Promise<Order> {
    const order = await polar.orders.get({ id: orderId });

    return order;
  }

  async getInvoice(orderId: string): Promise<OrderInvoice> {
    const invoice = await polar.orders.invoice({ id: orderId });

    return invoice;
  }
}

