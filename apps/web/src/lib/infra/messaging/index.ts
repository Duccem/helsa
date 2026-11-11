import { ENV } from "@/env.server";
import { mailer } from "@/services";
import { KapsoWhatsAppSender } from "./kapso-sender";
import { MailtoSender, WhatsAppLinkSender } from "./link-senders";
import { ResendEmailSender } from "./resend-sender";
import type { MessageChannel, MessageSender } from "./types";

export * from "./types";
export { whatsappTemplates } from "./whatsapp-templates";

/*
 * The one place that decides who delivers each channel. Kapso (WhatsApp) and
 * Resend (email) deliver when their keys are configured; otherwise the
 * therapist gets a prefilled link to send it themselves. Callers already
 * handle both outcomes ("sent" and "handoff").
 */

let kapso: KapsoWhatsAppSender | null | undefined;
let resend: ResendEmailSender | null | undefined;

const automatedSenders: Record<MessageChannel, () => MessageSender | null> = {
	whatsapp: () => {
		if (kapso === undefined) {
			kapso =
				ENV.KAPSO_API_KEY && ENV.KAPSO_PHONE_NUMBER_ID
					? new KapsoWhatsAppSender({
							apiKey: ENV.KAPSO_API_KEY,
							phoneNumberId: ENV.KAPSO_PHONE_NUMBER_ID,
							baseUrl: ENV.KAPSO_BASE_URL,
						})
					: null;
		}
		return kapso;
	},
	email: () => {
		if (resend === undefined) {
			resend = mailer.enabled ? new ResendEmailSender(mailer) : null;
		}
		return resend;
	},
};

const linkSenders: Record<MessageChannel, () => MessageSender> = {
	whatsapp: () => new WhatsAppLinkSender(),
	email: () => new MailtoSender(),
};

/** The prefilled link the therapist sends from their own WhatsApp or mail app. */
export function getLinkSender(channel: MessageChannel): MessageSender {
	return linkSenders[channel]();
}

/** The provider when configured, else the link the therapist sends. */
export function getMessageSender(channel: MessageChannel): MessageSender {
	return automatedSenders[channel]() ?? linkSenders[channel]();
}

/**
 * Only senders that deliver on their own. Background jobs (scheduled session
 * reminders) have no therapist to hand a link to, so they get null instead.
 */
export function getAutomatedSender(
	channel: MessageChannel,
): MessageSender | null {
	return automatedSenders[channel]();
}
