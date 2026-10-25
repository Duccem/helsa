import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import type { Database } from "@helsa/db";
import * as schema from "@helsa/db/schema/auth";
import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { bearer, lastLoginMethod, openAPI } from "better-auth/plugins";
import { configAdminPlugin } from "./lib/admin";
import { organizationConfigPlugin } from "./lib/organization";

export type AuthConfig = {
	BETTER_AUTH_URL: string;
	BETTER_AUTH_SECRET: string;
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
};

export function createAuth(env: AuthConfig, database: Database) {
	return betterAuth({
		appName: "helsa",
		database: drizzleAdapter(database, {
			provider: "pg",
			schema,
		}),
		baseURL: env.BETTER_AUTH_URL,
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: [env.BETTER_AUTH_URL],
		emailAndPassword: {
			enabled: true,
			resetPasswordTokenExpiresIn: 60 * 10,
			revokeSessionsOnPasswordReset: true,
			sendResetPassword: async ({ url }) => console.log(url),
			onPasswordReset: async ({ user }) => console.log(user.email),
		},
		// Pending: send these through the real mail provider, like the reset link.
		emailVerification: {
			sendVerificationEmail: async ({ url }) => console.log(url),
		},
		user: {
			// A new address only replaces the old one once its link is opened.
			changeEmail: { enabled: true },
			// Requires the password, or a session younger than `session.freshAge`.
			deleteUser: { enabled: true },
		},
		socialProviders: {
			google: {
				enabled: true,
				clientId: env.GOOGLE_CLIENT_ID || "",
				clientSecret: env.GOOGLE_CLIENT_SECRET || "",
				redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/google`,
			},
		},
		advanced: {
			database: {
				generateId: false,
			},
		},
		hooks: {
			after: createAuthMiddleware(async (ctx) => console.log(ctx)),
		},
		plugins: [
			configAdminPlugin,
			organizationConfigPlugin,
			lastLoginMethod(),
			bearer(),
			openAPI(),
			nextCookies(),
		],
	});
}

export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
export type BetterUser = ReturnType<
	typeof createAuth
>["$Infer"]["Session"]["user"];
