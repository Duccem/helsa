import type { WhatsAppTemplate } from "./types";

/*
 * WhatsApp templates Helsa sends through Kapso. Meta must approve each one
 * before it can be sent: `pnpm kapso:templates` (apps/web) submits them all.
 *
 * Changing a body here does not change the approved template: bump the name
 * (`_v2`) and submit again, or edit it in Kapso.
 */

const LANGUAGE = "es";

type TemplateDefinition<P extends string> = {
	name: string;
	category: "UTILITY";
	body: string;
	footer?: string;
	/** One example per parameter, required by Meta for review. */
	examples: Record<P, string>;
};

export const paymentReminderDefinition = {
	name: "helsa_payment_reminder",
	category: "UTILITY",
	body:
		"Hola {{patient_name}}, {{therapist_name}} te recuerda que tienes {{sessions}} pendiente de pago por un total de {{amount}}.\n\n" +
		"Si ya realizaste el pago, puedes ignorar este mensaje.",
	footer: "Helsa · Recordatorio de pago",
	examples: {
		patient_name: "Ana",
		therapist_name: "Dra. Laura Méndez",
		sessions: "2 sesiones",
		amount: "$80",
	},
} satisfies TemplateDefinition<
	"patient_name" | "therapist_name" | "sessions" | "amount"
>;

export const sessionReminderDefinition = {
	name: "helsa_session_reminder",
	category: "UTILITY",
	body:
		"Hola {{patient_name}}, te recordamos tu sesión con {{therapist_name}} el {{date}} a las {{time}} ({{modality}}).\n\n" +
		"Si no puedes asistir, avísale lo antes posible.",
	footer: "Helsa · Recordatorio de sesión",
	examples: {
		patient_name: "Ana",
		therapist_name: "Dra. Laura Méndez",
		date: "martes 12 de noviembre",
		time: "15:00",
		modality: "videollamada",
	},
} satisfies TemplateDefinition<
	"patient_name" | "therapist_name" | "date" | "time" | "modality"
>;

export const whatsappTemplateDefinitions = [
	paymentReminderDefinition,
	sessionReminderDefinition,
];

/** The body as Meta reviews it, in the shape `POST /message_templates` expects. */
export function toMetaTemplate(definition: TemplateDefinition<string>) {
	return {
		name: definition.name,
		language: LANGUAGE,
		category: definition.category,
		parameter_format: "NAMED",
		components: [
			{
				type: "BODY",
				text: definition.body,
				example: {
					body_text_named_params: Object.entries(definition.examples).map(
						([param_name, example]) => ({ param_name, example }),
					),
				},
			},
			...(definition.footer
				? [{ type: "FOOTER", text: definition.footer }]
				: []),
		],
	};
}

function template<P extends string>(
	definition: TemplateDefinition<P>,
	params: Record<P, string>,
): WhatsAppTemplate {
	return { name: definition.name, language: LANGUAGE, params };
}

export const whatsappTemplates = {
	paymentReminder: (
		params: Record<keyof typeof paymentReminderDefinition.examples, string>,
	) => template(paymentReminderDefinition, params),
	sessionReminder: (
		params: Record<keyof typeof sessionReminderDefinition.examples, string>,
	) => template(sessionReminderDefinition, params),
};
