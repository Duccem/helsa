import { MailtoSender, WhatsAppLinkSender } from "./link-senders";
import type { MessageChannel, MessageSender } from "./types";

export * from "./types";

/*
 * The one place that decides who delivers each channel. To send for real,
 * add an adapter that implements `MessageSender` and return it here when its
 * keys are configured, for example:
 *
 *   email:    if (ENV.RESEND_API_KEY) return new ResendSender(...)
 *   whatsapp: if (ENV.TWILIO_ACCOUNT_SID) return new TwilioWhatsAppSender(...)
 *
 * Callers already handle both outcomes ("sent" and "handoff").
 */
const senders: Record<MessageChannel, () => MessageSender> = {
	whatsapp: () => new WhatsAppLinkSender(),
	email: () => new MailtoSender(),
};

export function getMessageSender(channel: MessageChannel): MessageSender {
	return senders[channel]();
}
