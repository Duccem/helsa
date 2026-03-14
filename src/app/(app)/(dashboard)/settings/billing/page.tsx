import { requireAuth } from "@/modules/auth/infrastructure/guards/require-auth";
import InvoiceList from "@/modules/billing/presentation/components/invoice-list";
import { SubscriptionStatus } from "@/modules/billing/presentation/components/subscription-status";
import { Usage } from "@/modules/billing/presentation/components/usage";

export default async function BillingPage() {
  await requireAuth();

  return (
    <div className="flex w-full mx-auto flex-col gap-6 pb-4">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold leading-none">Billing</h1>
        <p className=" text-muted-foreground">Manage your billing settings.</p>
      </div>
      <SubscriptionStatus />
      <Usage />
      <InvoiceList />
    </div>
  );
}

