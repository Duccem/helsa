import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import type { Database } from "@helsa/db";
import * as schema from "@helsa/db/schema/auth";
import { createMailer } from "@helsa/email";
import { waitUntil } from "@vercel/functions";
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
	RESEND_API_KEY?: string;
	EMAIL_FROM: string;
};

const RESET_PASSWORD_EXPIRES_IN = 60 * 10;

/** Keeps the work alive after the response is sent (Vercel), and logs instead of crashing. */
function runInBackground(task: Promise<unknown>) {
	waitUntil(
		task.catch((error) =>
			console.error("[auth] background task failed", error),
		),
	);
}

export function createAuth(env: AuthConfig, database: Database) {
	const mailer = createMailer({
		RESEND_API_KEY: env.RESEND_API_KEY,
		EMAIL_FROM: env.EMAIL_FROM,
		BASE_URL: env.BETTER_AUTH_URL,
	});

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
			resetPasswordTokenExpiresIn: RESET_PASSWORD_EXPIRES_IN,
			revokeSessionsOnPasswordReset: true,
			// Better Auth hands this promise to `advanced.backgroundTasks`, so the
			// response time does not reveal whether the address has an account.
			sendResetPassword: ({ user, url }) =>
				mailer.sendResetPasswordEmail(
					user,
					url,
					RESET_PASSWORD_EXPIRES_IN / 60,
				),
			// Better Auth awaits this one inside the request, so send it in the background.
			onPasswordReset: async ({ user }) => {
				runInBackground(mailer.sendPasswordChangedEmail(user));
			},
		},
		emailVerification: {
			sendOnSignUp: true,
			// Also used by `changeEmail`: there `user.email` is already the new address.
			sendVerificationEmail: ({ user, url }) =>
				mailer.sendVerificationEmail(user, url),
		},
		databaseHooks: {
			user: {
				create: {
					// Covers email sign-up and the first Google sign-in alike.
					after: async (user) => {
						runInBackground(mailer.sendWelcomeEmail(user));
					},
				},
			},
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
			backgroundTasks: {
				handler: waitUntil,
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
