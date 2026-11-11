import type { ReactElement } from "react";
import { CommonError } from "@/lib/utils/error";

/*
 * Outgoing messages to patients (payment and session reminders).
 *
 * Use cases only see `MessageSender`. Each channel has one adapter chosen in
 * `index.ts`: Kapso (WhatsApp) and Resend (email) when their keys are set,
 * otherwise a prefilled link the therapist sends from their own WhatsApp or
 * mail app.
 */

export type MessageChannel = "whatsapp" | "email";

/**
 * An approved WhatsApp template. Helsa writes first, so outside the 24-hour
 * customer service window WhatsApp only delivers templates, never free text.
 */
export type WhatsAppTemplate = {
	name: string;
	/** Template language code, e.g. "es". */
	language: string;
	/** Named body parameters, `{{patient_name}}` → `{ patient_name: "Ana" }`. */
	params: Record<string, string>;
};

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
	/** Plain text: the whole message for links, the fallback for rich email. */
	text: string;
	/** Rich email body (react-email). Without it, `text` is sent as is. */
	emailTemplate?: ReactElement;
	/** Email only: where the patient's reply goes (the therapist). */
	replyTo?: string | null;
	/** Required by automated WhatsApp. Links ignore it and use `text`. */
	whatsappTemplate?: WhatsAppTemplate;
	/** Stops a retried job from sending the same message twice (Resend honors it 24h). */
	idempotencyKey?: string;
};

export type Delivery =
	/** A provider accepted the message. */
	| { status: "sent"; provider: string; providerMessageId: string | null }
	/** Nothing was sent: the therapist opens `url` and sends it themselves. */
	| { status: "handoff"; provider: string; url: string };

export interface MessageSender {
	readonly channel: MessageChannel;
	/** Stored with each message, e.g. "whatsapp_link", "resend", "kapso". */
	readonly provider: string;
	/**
	 * True when Helsa itself delivers the message (Resend, Kapso). Automated
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
