import { createElement, type ReactElement } from "react";
import { render } from "react-email";
import { Resend } from "resend";
import PasswordChangedEmail from "./templates/password-changed";
import ResetPasswordEmail from "./templates/reset-password";
import VerifyEmail from "./templates/verify-email";
import WelcomeEmail from "./templates/welcome";

export type MailerConfig = {
	/** Resend API key. When missing, emails are logged instead of sent (local dev). */
	RESEND_API_KEY?: string;
	/** Sender, e.g. `Helsa <no-reply@helsa.app>`. Its domain must be verified in Resend. */
	EMAIL_FROM: string;
	/** Absolute origin of the app, used for the logo and links inside the emails. */
	BASE_URL: string;
};

type Recipient = { email: string; name?: string | null };

type SendInput = {
	to: string;
	subject: string;
	template: ReactElement;
	/** Lets Resend drop a retry of the same email within 24h. */
	idempotencyKey?: string;
	/** Where replies go, e.g. the therapist who sent a reminder. */
	replyTo?: string;
};

export type SendResult = {
	/** Resend email id, or null when nothing was sent (no API key). */
	id: string | null;
};

function displayName(user: Recipient) {
	return user.name?.trim() || user.email.split("@")[0] || "";
}

export function createMailer(config: MailerConfig) {
	const resend = config.RESEND_API_KEY
		? new Resend(config.RESEND_API_KEY)
		: null;
	const baseUrl = config.BASE_URL.replace(/\/$/, "");

	async function send({
		to,
		subject,
		template,
		idempotencyKey,
		replyTo,
	}: SendInput): Promise<SendResult> {
		if (!resend) {
			console.warn(
				`[email] RESEND_API_KEY not set, skipping "${subject}" to ${to}`,
			);
			return { id: null };
		}

		const [html, text] = await Promise.all([
			render(template),
			render(template, { plainText: true }),
		]);

		const { data, error } = await resend.emails.send(
			{ from: config.EMAIL_FROM, to, subject, html, text, replyTo },
			idempotencyKey ? { idempotencyKey } : undefined,
		);

		// Resend reports failures in the result instead of throwing.
		if (error) {
			throw new Error(`[email] "${subject}" to ${to} failed: ${error.message}`);
		}
		return { id: data?.id ?? null };
	}

	/** Auth callbacks expect `Promise<void>`; they don't need the email id. */
	async function deliver(input: SendInput): Promise<void> {
		await send(input);
	}

	return {
		/** True when emails really go out (a Resend key is configured). */
		enabled: resend !== null,
		baseUrl,
		/** Sends any template; the app's notification code builds its own. */
		send,

		sendResetPasswordEmail(
			user: Recipient,
			url: string,
			expiresInMinutes: number,
		) {
			if (!resend)
				console.info(`[email] reset password link for ${user.email}: ${url}`);
			return deliver({
				to: user.email,
				subject: "Restablece tu contraseña",
				template: createElement(ResetPasswordEmail, {
					baseUrl,
					name: displayName(user),
					url,
					expiresInMinutes,
				}),
			});
		},

		sendPasswordChangedEmail(user: Recipient, changedAt = new Date()) {
			return deliver({
				to: user.email,
				subject: "Tu contraseña se cambió",
				template: createElement(PasswordChangedEmail, {
					baseUrl,
					name: displayName(user),
					changedAt,
				}),
			});
		},

		sendVerificationEmail(user: Recipient, url: string) {
			if (!resend)
				console.info(`[email] verification link for ${user.email}: ${url}`);
			return deliver({
				to: user.email,
				subject: "Confirma tu correo electrónico",
				template: createElement(VerifyEmail, {
					baseUrl,
					name: displayName(user),
					url,
				}),
			});
		},

		sendWelcomeEmail(user: Recipient & { id: string }) {
			return deliver({
				to: user.email,
				subject: "Bienvenido a Helsa",
				template: createElement(WelcomeEmail, {
					baseUrl,
					name: displayName(user),
				}),
				idempotencyKey: `welcome/${user.id}`,
			});
		},
	};
}

export type Mailer = ReturnType<typeof createMailer>;
