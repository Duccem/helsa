# Billing

The platform integrates with [Polar](https://polar.sh/) for subscription management, order tracking, and invoice generation.

## Architecture

The billing module follows the same DDD pattern with a domain port (abstract class) and infrastructure implementation:

```
billing/
├── domain/
│   └── billing-service.ts          # BillingService port (abstract class)
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

## BillingService Port

```typescript
export abstract class BillingService {
  abstract createCustomer(externalId: string, email: string, name: string): Promise<void>;
  abstract createSubscription(customerId: string, planId: string): Promise<void>;
  abstract getSubscriptionStatus(customerId: string): Promise<SubscriptionStatus>;
  abstract getOrders(customerId: string, page: number): Promise<OrderList>;
  abstract getOrder(orderId: string): Promise<Order>;
  abstract getInvoice(orderId: string): Promise<string>; // Returns invoice PDF URL
}
```

`BillingService` is declared as an abstract class (not a TypeScript interface) so the `diod` container can use it as a runtime DI token. The Polar implementation is bound to it in `diod.config.ts`, and use cases receive it through their constructor. This abstraction allows the billing provider to be swapped without changing application or domain code.

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
