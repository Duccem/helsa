import { getSession } from "@/modules/auth/infrastructure/helpers/get-session";
import { AcceptInvitationFlow } from "@/modules/auth/presentation/components/accept-invitation-flow";

interface AcceptInvitationPageProps {
  searchParams?: Promise<{
    invitationId?: string | string[];
  }>;
}

export default async function AcceptInvitationPage({ searchParams }: AcceptInvitationPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const invitationIdParam = resolvedSearchParams.invitationId;
  const invitationId = Array.isArray(invitationIdParam) ? invitationIdParam[0] : invitationIdParam;
  const session = await getSession();

  return (
    <div className="w-full max-w-xl px-4">
      <AcceptInvitationFlow invitationId={invitationId} isAuthenticated={Boolean(session)} />
    </div>
  );
}
