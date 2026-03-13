import InviteMember from "@/modules/auth/presentation/components/organization/invite-member";
import { ListOrganizationMembers } from "@/modules/auth/presentation/components/organization/list-organization-members";
import ListPendingInvitations from "@/modules/auth/presentation/components/organization/list-pending-invitations";

export default function TeamSettingsPage() {
  return (
    <div className="flex w-full  mx-auto flex-col gap-6 pb-4">
      <div>
        <h1 className="text-2xl font-semibold leading-none">Team Settings</h1>
        <p className=" text-muted-foreground">Manage your team settings.</p>
      </div>
      <InviteMember />
      <ListPendingInvitations />
      <ListOrganizationMembers />
    </div>
  );
}

