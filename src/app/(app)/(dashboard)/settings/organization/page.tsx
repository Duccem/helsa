import { DeleteOrganization } from "@/modules/auth/presentation/components/organization/delete-organization";
import { OrganizationDetails } from "@/modules/auth/presentation/components/organization/organization-details";

export default function Pag() {
  return (
    <div className="flex w-full  mx-auto flex-col gap-6 pb-10">
      <div>
        <h1 className="text-2xl font-semibold leading-none">Hospital Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your hospital settings and preferences.</p>
      </div>
      <OrganizationDetails />
      <DeleteOrganization />
    </div>
  );
}

