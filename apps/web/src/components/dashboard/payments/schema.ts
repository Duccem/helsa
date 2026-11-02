import z from "zod";

import { paymentMethods } from "../settings/schema";

/*
 * Shapes for the payments page. The dialogs and the API routes validate
 * against the same schemas.
 */

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Elige una fecha.");

const amount = z
	.number({ error: "Escribe un monto." })
	.positive("El monto debe ser mayor que cero.")
	.max(1_000_000_000, "Revisa ese monto.")
	.nullable();

const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max, `Usa ${max} caracteres o menos.`)
		.transform((value) => value || null);

export const recordPaymentSchema = z
	.object({
		patientId: z.uuid("Elige un paciente."),
		sessionIds: z.array(z.uuid()).max(30, "Elige hasta 30 sesiones."),
		method: z.enum(paymentMethods, { error: "Elige cómo pagó." }),
		currency: z.enum(["usd", "ves"]),
		amountUsd: amount,
		amountVes: amount,
		vesPerUsd: z
			.number({ error: "Escribe la tasa." })
			.positive("La tasa debe ser mayor que cero.")
			.max(1_000_000, "Revisa esa tasa.")
			.nullable(),
		paidOn: day,
		reference: optionalText(80),
		note: optionalText(500),
		proofFileId: z.uuid().nullable(),
		/** The therapist already checked it against their bank or wallet. */
		verified: z.boolean(),
	})
	.superRefine((value, ctx) => {
		if (value.currency === "usd" && value.amountUsd === null) {
			ctx.addIssue({
				code: "custom",
				path: ["amountUsd"],
				message: "Escribe el monto en dólares.",
			});
		}
		if (value.currency === "ves") {
			if (value.amountVes === null) {
				ctx.addIssue({
					code: "custom",
					path: ["amountVes"],
					message: "Escribe el monto en bolívares.",
				});
			}
			if (value.vesPerUsd === null) {
				ctx.addIssue({
					code: "custom",
					path: ["vesPerUsd"],
					message: "Escribe la tasa usada.",
				});
			}
		}
	});
export type RecordPaymentInput = z.input<typeof recordPaymentSchema>;
export type RecordPaymentData = z.output<typeof recordPaymentSchema>;

export const reviewPaymentSchema = z.discriminatedUnion("decision", [
	z.object({ decision: z.literal("verify") }),
	z.object({
		decision: z.literal("reject"),
		reason: z
			.string()
			.trim()
			.min(3, "Cuéntale al paciente qué pasó.")
			.max(300, "Usa 300 caracteres o menos."),
	}),
]);
export type ReviewPaymentInput = z.infer<typeof reviewPaymentSchema>;

export const sendReminderSchema = z.object({
	patientId: z.uuid(),
	channel: z.enum(["whatsapp", "email"]),
	message: z
		.string()
		.trim()
		.min(10, "Escribe el mensaje.")
		.max(1500, "Usa 1500 caracteres o menos."),
});
export type SendReminderInput = z.infer<typeof sendReminderSchema>;
