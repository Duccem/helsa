export interface AuthNotifier {
  notifyPasswordResetRequest: (email: string, url: string, token: string) => Promise<void>;
  notifyPasswordResetSuccess: (email: string, name: string) => Promise<void>;
  notifyInvitationSent: (email: string, role: string, organizationName: string, invitationUrl: string) => Promise<void>;
  notifyInvitationAccepted: (organization: { id: string; name: string }, user: { email: string }) => Promise<void>;
  notifyOrganizationCreated: (organization: { id: string; name: string }, email: string) => Promise<void>;
  notifyWelcomeEmail: (email: string, name: string) => Promise<void>;
}

