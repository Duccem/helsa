export abstract class AuthNotifier {
  abstract notifyPasswordResetRequest(email: string, url: string, token: string): Promise<void>;
  abstract notifyPasswordResetSuccess(email: string, name: string): Promise<void>;
  abstract notifyInvitationSent(
    email: string,
    role: string,
    organizationName: string,
    invitationUrl: string,
  ): Promise<void>;
  abstract notifyInvitationAccepted(
    organization: { id: string; name: string },
    user: { email: string },
  ): Promise<void>;
  abstract notifyOrganizationCreated(organization: { id: string; name: string }, email: string): Promise<void>;
  abstract notifyWelcomeEmail(email: string, name: string): Promise<void>;
}

