import { GraphApiError, WhatsAppClient } from "@kapso/whatsapp-cloud-api";
import {
	type Delivery,
	MessageNotDelivered,
	type MessageSender,
	type OutgoingMessage,
	RecipientMissing,
} from "./types";

export type KapsoConfig = {
	apiKey: string;
	/** Meta phone number id of the Helsa WhatsApp line. */
	phoneNumberId: string;
	/** Kapso's Meta proxy, `https://api.kapso.ai/meta/whatsapp`. */
	baseUrl: string;
	/** Tests pass a fake one; defaults to the global fetch. */
	fetch?: typeof fetch;
};

/** Template parameters can't carry new lines, tabs or runs of 4+ spaces. */
function cleanParam(value: string) {
	return value
		.replace(/[\n\r\t]+/g, " ")
		.replace(/ {4,}/g, "   ")
		.trim();
}

/** Sends WhatsApp templates from Helsa's own number, through Kapso. */
export class KapsoWhatsAppSender implements MessageSender {
	readonly channel = "whatsapp" as const;
	readonly provider = "kapso";
	readonly automated = true;

	private client: WhatsAppClient;

	constructor(private config: KapsoConfig) {
		this.client = new WhatsAppClient({
			baseUrl: config.baseUrl,
			kapsoApiKey: config.apiKey,
			graphVersion: "v24.0",
			fetch: config.fetch,
		});
	}

	async send(message: OutgoingMessage): Promise<Delivery> {
		const to = message.to.phone?.replace(/\D/g, "");
		if (!to) throw new RecipientMissing(this.channel);

		// Helsa starts these conversations, so WhatsApp only accepts templates.
		const template = message.whatsappTemplate;
		if (!template) {
			throw new MessageNotDelivered(
				this.provider,
				"falta la plantilla de WhatsApp",
			);
		}

		try {
			const response = await this.client.messages.sendTemplate({
				phoneNumberId: this.config.phoneNumberId,
				to,
				template: {
					name: template.name,
					language: { code: template.language },
					components: [
						{
							type: "body",
							parameters: Object.entries(template.params).map(
								([parameterName, text]) => ({
									type: "text" as const,
									parameterName,
									text: cleanParam(text),
								}),
							),
						},
					],
				},
			});

			return {
				status: "sent",
				provider: this.provider,
				providerMessageId: response.messages[0]?.id ?? null,
			};
		} catch (error) {
			if (error instanceof GraphApiError) {
				throw new MessageNotDelivered(this.provider, error.message);
			}
			throw error;
		}
	}
}
