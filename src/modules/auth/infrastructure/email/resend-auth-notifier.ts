import { resend } from "@/modules/shared/infrastructure/email";
import { AuthNotifier } from "../../domain/auth-notifier";
import PasswordResetEmail from "@/modules/shared/infrastructure/email/templates/reset-password-email";
import PasswordChangedEmail from "@/modules/shared/infrastructure/email/templates/password-changed";
import OrganizationInvitationEmail from "@/modules/shared/infrastructure/email/templates/organization-invitation-email";
import InvitationAcceptedEmail from "@/modules/shared/infrastructure/email/templates/invitation-accepted-email";
import OrganizationCreatedEmail from "@/modules/shared/infrastructure/email/templates/organization-created-email";
import WelcomeSignupEmail from "@/modules/shared/infrastructure/email/templates/welcome-signup";

export class ResendAuthNotifier implements AuthNotifier {
  async notifyPasswordResetRequest(email: string, url: string, token: string): Promise<void> {
    await resend.emails.send({
      from: "Helsa <onboarding@resend.dev>",
      to: [email],
      subject: "Password Reset Request",
      react: PasswordResetEmail({ resetPasswordUrl: `${url}?token=${token}` }),
    });
  }
  async notifyPasswordResetSuccess(email: string, name: string): Promise<void> {
    await resend.emails.send({
      from: "Helsa <onboarding@resend.dev>",
      to: [email],
      subject: "Password Reset Successful",
      react: PasswordChangedEmail({ userName: name }),
    });
  }
  async notifyInvitationSent(email: string, role: string): Promise<void> {
    await resend.emails.send({
      from: "Helsa <onboarding@resend.dev>",
      to: [email],
      subject: "Invitation to join your organization",
      react: OrganizationInvitationEmail({ role }),
    });
  }
  async notifyInvitationAccepted(organization: { id: string; name: string }, user: { email: string }): Promise<void> {
    await resend.emails.send({
      from: "Helsa <onboarding@resend.dev>",
      to: [user.email],
      subject: `Invitation accepted in ${organization.name}`,
      react: InvitationAcceptedEmail({ organizationName: organization.name, userEmail: user.email }),
    });
  }

  async notifyOrganizationCreated(organization: { id: string; name: string }, email: string): Promise<void> {
    await resend.emails.send({
      from: "Helsa <onboarding@resend.dev>",
      to: [email],
      subject: `Organization ${organization.name} created`,
      react: OrganizationCreatedEmail({ organizationName: organization.name, organizationId: organization.id }),
    });
  }

  async notifyWelcomeEmail(email: string, name: string): Promise<void> {
    await resend.emails.send({
      from: "",
      to: [email],
      subject: "Welcome to Helsa",
      react: WelcomeSignupEmail({ userName: name }),
    });
  }
}

