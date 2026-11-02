import {
	type Delivery,
	type MessageSender,
	type OutgoingMessage,
	RecipientMissing,
} from "./types";

/** Opens a WhatsApp chat with the text already written. */
export class WhatsAppLinkSender implements MessageSender {
	readonly channel = "whatsapp" as const;
	readonly provider = "whatsapp_link";
	readonly automated = false;

	async send(message: OutgoingMessage): Promise<Delivery> {
		const digits = message.to.phone?.replace(/\D/g, "");
		if (!digits) throw new RecipientMissing(this.channel);

		return {
			status: "handoff",
			provider: this.provider,
			url: `https://wa.me/${digits}?text=${encodeURIComponent(message.text)}`,
		};
	}
}

/** Opens the therapist's mail app with a draft. */
export class MailtoSender implements MessageSender {
	readonly channel = "email" as const;
	readonly provider = "mailto";
	readonly automated = false;

	async send(message: OutgoingMessage): Promise<Delivery> {
		const email = message.to.email?.trim();
		if (!email) throw new RecipientMissing(this.channel);

		const query = new URLSearchParams({
			subject: message.subject ?? "",
			body: message.text,
		})
			.toString()
			// mailto clients read "+" literally; spaces must be %20.
			.replace(/\+/g, "%20");

		return {
			status: "handoff",
			provider: this.provider,
			url: `mailto:${email.replace(/[?&#\s]/g, "")}?${query}`,
		};
	}
}
