# Billing

The platform integrates with [Polar](https://polar.sh/) for subscription management, order tracking, and invoice generation.

## Architecture

The billing module follows the same DDD pattern with a domain interface and infrastructure implementation:

```
billing/
├── domain/
│   └── billing-service.ts          # BillingService interface
├── application/
│   ├── initialize-new-user-billing.ts
│   ├── initialize-new-organization-billing.ts
│   ├── get-subscription-status.ts
│   ├── get-order-list.ts
│   └── get-or-generate-invoice.ts
└── infrastructure/
    ├── polar-client.ts             # Polar SDK client
    ├── polar-billing-service.ts    # BillingService implementation
    └── polar-products.ts           # Product/plan definitions
```

## BillingService Interface

```typescript
interface BillingService {
  createCustomer(externalId: string, email: string, name: string): Promise<void>;
  createSubscription(customerId: string, planId: string): Promise<void>;
  getSubscriptionStatus(customerId: string): Promise<SubscriptionStatus>;
  getOrders(customerId: string, page: number): Promise<OrderList>;
  getOrder(orderId: string): Promise<Order>;
  getInvoice(orderId: string): Promise<string>; // Returns invoice PDF URL
}
```

This abstraction allows the billing provider to be swapped without changing application or domain code.

## Polar Client

**File**: `src/modules/billing/infrastructure/polar-client.ts`

```typescript
export const polar = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.POLAR_MODE || "sandbox",
});
```

Supports sandbox mode for development and production mode for live billing.

## Lifecycle

1. **User signs up** → `user.created` domain event → Inngest workflow → `InitializeNewUserBilling` → Creates Polar customer
2. **Organization created** → Similar flow → `InitializeNewOrganizationBilling`
3. **User subscribes** → Polar checkout flow → Webhook confirms subscription
4. **Dashboard** → `GetSubscriptionStatus`, `GetOrderList`, `GetOrGenerateInvoice` for self-service billing management

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/billing` | Current subscription status |
| GET | `/api/billing/orders` | Paginated order history |
| GET | `/api/billing/usage` | Usage metrics |
| GET | `/api/billing/invoice/[orderId]` | Invoice PDF URL |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `POLAR_ACCESS_TOKEN` | Polar API access token |
| `POLAR_MODE` | `sandbox` or `production` |
| `POLAR_WEBHOOK_SECRET` | Webhook signature validation |
| `POLAR_SUCCESS_URL` | Post-purchase redirect URL |
