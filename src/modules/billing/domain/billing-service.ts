export interface BillingService {
  createCustomer(organization: { id: string; name: string }): Promise<{ customerId: string }>;
  createSubscription(customerId: string, planId: string): Promise<{ subscriptionId: string }>;
}
