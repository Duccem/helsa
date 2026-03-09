import { database } from "@/modules/shared/infrastructure/database/client";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "./persistence/auth.schema";
import { env } from "@/modules/shared/infrastructure/env";
import { bearer, lastLoginMethod, openAPI, organization } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { ac, roles } from "./roles";
import { OrganizationCreatedNotify } from "../application/organization-created-notify";
import { InvitationAccepted } from "../application/invitation-accepted";
import { SendInvitation } from "../application/send-invitation";

export const auth = betterAuth({
  database: drizzleAdapter(database, {
    provider: "pg",
    schema,
  }),
  trustedOrigins: [env.BETTER_AUTH_URL!],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ token, url, user }) => {
      console.log("Send reset password email to:", user.email);
      console.log("Reset password URL:", url);
      console.log("Reset password token:", token);
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
  plugins: [
    organization({
      ac,
      roles,
      creatorRole: "admin",
      sendInvitationEmail: async ({ email, role }) => {
        await new SendInvitation().execute({ email, role });
      },
      organizationHooks: {
        afterCreateOrganization: async ({ organization }) => {
          await new OrganizationCreatedNotify().execute({ id: organization.id, name: organization.name });
        },
        afterAcceptInvitation: async ({ organization, user }) => {
          await new InvitationAccepted().execute({
            organization: { id: organization.id, name: organization.name },
            user: { email: user.email },
          });
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

