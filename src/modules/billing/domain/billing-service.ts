export type OrganizationCustomer = {
  id: string;
  name: string;
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
export interface BillingService {
  createCustomer(organization: OrganizationCustomer): Promise<Customer>;
  createSubscription(customerId: string, planId: string): Promise<Subscription>;
  getSubscriptionStatus(externalCustomerId: string): Promise<SubscriptionStatus>;
  getOrders(externalCustomerId: string, page: number): Promise<OrdersResponse>;
  getOrder(orderId: string): Promise<Order>;
  getInvoice(orderId: string): Promise<OrderInvoice>;
}

