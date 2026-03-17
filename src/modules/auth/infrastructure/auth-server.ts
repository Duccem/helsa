import { database } from "@/modules/shared/infrastructure/database/client";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "./persistence/auth.schema";
import { env } from "@/modules/shared/infrastructure/env";
import { bearer, lastLoginMethod, openAPI, organization, admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { ac, roles } from "./roles";
import { ResendAuthNotifier } from "./email/resend-auth-notifier";
import { createAuthMiddleware } from "better-auth/api";
import { OrganizationCreation } from "../application/organization-creation";
import { InngestEventBus } from "@/modules/shared/infrastructure/event-bus/inngest-event-bus";
import { acAdmin, adminRoles } from "./roles-admin";
import { UserRegistration } from "../application/user-registration";

const notifier = new ResendAuthNotifier();
const eventBus = new InngestEventBus();
const organizationCreationService = new OrganizationCreation(notifier, eventBus);
const userRegistrationService = new UserRegistration(notifier, eventBus);

export const auth = betterAuth({
  database: drizzleAdapter(database, {
    provider: "pg",
    schema,
  }),
  trustedOrigins: [env.BETTER_AUTH_URL!],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ token, url, user }) => {
      await notifier.notifyPasswordResetRequest(user.email, url, token);
    },
    onPasswordReset: async ({ user }) => {
      await notifier.notifyPasswordResetSuccess(user.email, user.name);
    },
    resetPasswordTokenExpiresIn: 60 * 10,
    revokeSessionsOnPasswordReset: true,
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
      redirectURI: `${env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`,
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/sign-up")) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          await userRegistrationService.execute({
            id: newSession.user.id,
            name: newSession.user.name,
            email: newSession.user.email,
          });
        }
      }
    }),
  },
  plugins: [
    admin({
      ac: acAdmin,
      roles: adminRoles,
      adminRoles: ["superadmin", "admin"],
      defaultRole: "doctor",
    }),
    organization({
      ac,
      roles,
      creatorRole: "admin",
      sendInvitationEmail: async ({ id, email, role, organization }) => {
        const invitationUrl = `${env.NEXT_PUBLIC_BASE_URL}/accept-invitation?invitationId=${encodeURIComponent(id)}`;
        await notifier.notifyInvitationSent(email, role, organization.name, invitationUrl);
      },
      organizationHooks: {
        afterCreateOrganization: async ({ organization, user }) => {
          await organizationCreationService.execute({ id: organization.id, name: organization.name }, user.email);
        },
        afterAcceptInvitation: async ({ organization, user }) => {
          await notifier.notifyInvitationAccepted(
            { id: organization.id, name: organization.name },
            { email: user.email },
          );
        },
      },
    }),
    nextCookies(),
    lastLoginMethod(),
    bearer(),
    openAPI(),
  ],
});

export type BetterSession = typeof auth.$Infer.Session;
export type BetterUser = typeof auth.$Infer.Session.user;
export type BetterOrganization = typeof auth.$Infer.Organization;

