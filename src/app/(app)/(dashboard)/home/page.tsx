import { requireAuth } from "@/modules/auth/infrastructure/guards/require-auth";
import { requireOrganizations } from "@/modules/auth/infrastructure/guards/require-organization";

export default async function HomePage() {
  const session = await requireAuth();
  await requireOrganizations(session.user.role ?? undefined);
  return (
    <div className="flex flex-col gap-6 w-2/3">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl text-foreground">Welcome to your dashboard</h2>
        <p className="text-muted-foreground">
          This is your dashboard where you can manage your account, view your activity, and access exclusive features.
          Use the navigation menu to explore different sections of your dashboard. If you have any questions or need
          assistance, feel free to contact our support team.
        </p>
      </div>
    </div>
  );
}

