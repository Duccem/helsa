import type { Mailer } from "@helsa/email";
import PlainMessageEmail from "@helsa/email/templates/plain-message";
import { createElement } from "react";
import {
	type Delivery,
	MessageNotDelivered,
	type MessageSender,
	type OutgoingMessage,
	RecipientMissing,
} from "./types";

/** Sends email from Helsa's own domain, through Resend. */
export class ResendEmailSender implements MessageSender {
	readonly channel = "email" as const;
	readonly provider = "resend";
	readonly automated = true;

	constructor(private mailer: Mailer) {}

	async send(message: OutgoingMessage): Promise<Delivery> {
		const email = message.to.email?.trim();
		if (!email) throw new RecipientMissing(this.channel);

		const subject = message.subject ?? "Mensaje de Helsa";
		const template =
			message.emailTemplate ??
			createElement(PlainMessageEmail, {
				baseUrl: this.mailer.baseUrl,
				preview: subject,
				text: message.text,
			});

		try {
			const { id } = await this.mailer.send({
				to: email,
				subject,
				template,
				replyTo: message.replyTo ?? undefined,
				idempotencyKey: message.idempotencyKey,
			});
			return { status: "sent", provider: this.provider, providerMessageId: id };
		} catch (error) {
			throw new MessageNotDelivered(
				this.provider,
				error instanceof Error ? error.message : String(error),
			);
		}
	}
}
