export type NewCustomerPayload = {
  id: string;
  name: string;
  email: string;
};
export type Customer = {
  customerId: string;
};
export type Subscription = {
  subscriptionId: string;
};
export type SubscriptionStatus = {
  id: string;
  externalId: string;
  activeSubscriptions: Array<{ id: string; productId: string }>;
};
export type Order = {
  id: string;
  productId: string | null;
  status: string;
  totalAmount: number;
  isInvoiceGenerated: boolean;
};
export type OrdersResponse = {
  items: Order[];
  pagination: { totalCount: number; maxPage: number };
};

export type OrderInvoice = {
  url: string;
};
export abstract class BillingService {
  abstract createCustomer(organization: NewCustomerPayload): Promise<Customer>;
  abstract createSubscription(customerId: string, planId: string): Promise<Subscription>;
  abstract getSubscriptionStatus(externalCustomerId: string): Promise<SubscriptionStatus>;
  abstract getOrders(externalCustomerId: string, page: number): Promise<OrdersResponse>;
  abstract getOrder(orderId: string): Promise<Order>;
  abstract getInvoice(orderId: string): Promise<OrderInvoice>;
}

