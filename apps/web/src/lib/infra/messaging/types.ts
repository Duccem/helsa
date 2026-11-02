import { CommonError } from "@/lib/utils/error";

/*
 * Outgoing messages to patients (payment reminders today, more later).
 *
 * Use cases only see `MessageSender`. Each channel has one adapter chosen in
 * `index.ts`: today they hand a prefilled link back to the therapist, who
 * sends it from their own WhatsApp or mail app. A provider adapter (Resend for
 * email, Twilio for WhatsApp) can replace them without touching the callers.
 */

export type MessageChannel = "whatsapp" | "email";

export type OutgoingMessage = {
	channel: MessageChannel;
	to: {
		name: string;
		/** E.164, "+584125550101". */
		phone?: string | null;
		email?: string | null;
	};
	/** Email only. */
	subject?: string;
	text: string;
};

export type Delivery =
	/** A provider accepted the message. */
	| { status: "sent"; provider: string; providerMessageId: string | null }
	/** Nothing was sent: the therapist opens `url` and sends it themselves. */
	| { status: "handoff"; provider: string; url: string };

export interface MessageSender {
	readonly channel: MessageChannel;
	/** Stored with each message, e.g. "whatsapp_link", "resend". */
	readonly provider: string;
	/**
	 * True when Helsa itself delivers the message (Resend, Twilio). Automated
	 * WhatsApp needs the patient's opt-in; a link the therapist sends from
	 * their own phone does not.
	 */
	readonly automated: boolean;
	send(message: OutgoingMessage): Promise<Delivery>;
}

export class RecipientMissing extends CommonError {
	constructor(channel: MessageChannel) {
		super(
			channel === "whatsapp"
				? "Este paciente no tiene un teléfono registrado."
				: "Este paciente no tiene un correo registrado.",
		);
	}
}

export class MessageNotDelivered extends CommonError {
	constructor(provider: string, reason: string) {
		super(`No pudimos enviar el mensaje (${provider}): ${reason}`);
	}
}
