import { requireAuth } from "@/modules/auth/infrastructure/guards/require-auth";
import { CreateOrganizationForm } from "@/modules/auth/presentation/components/organization/create-organization-form";

export default async function NewOrganizationPage() {
  await requireAuth();
  return (
    <div className="flex flex-col gap-4 items-center justify-center w-1/3">
      <div className="w-full  space-y-8">
        <div className="flex flex-col items-center justify-center gap-2 text-center mb-8">
          <img src="/images/logo.png" alt="" className="h-10 rounded-sm" />
          <h1 className="text-2xl font-semibold text-foreground">Helsa</h1>
        </div>
      </div>
      <CreateOrganizationForm />
    </div>
  );
}

