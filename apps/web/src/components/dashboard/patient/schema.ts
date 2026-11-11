import z from "zod";

import { checkPaymentAmount, paymentFields } from "../payments/schema";

/*
 * Shapes for what a patient sends from the portal. The forms and the API
 * routes validate against the same schemas.
 */

export const MOOD_MIN = 1;
export const MOOD_MAX = 10;
export const ENTRY_MAX = 4000;

export const taskEntrySchema = z
	.object({
		mood: z
			.number()
			.int()
			.min(MOOD_MIN, "Elige del 1 al 10.")
			.max(MOOD_MAX, "Elige del 1 al 10.")
			.nullable(),
		content: z
			.string()
			.trim()
			.max(ENTRY_MAX, `Usa ${ENTRY_MAX} caracteres o menos.`)
			.transform((value) => value || null),
	})
	.refine((value) => value.mood !== null || value.content !== null, {
		path: ["content"],
		message: "Escribe algo o marca cómo te sientes.",
	});
export type TaskEntryInput = z.input<typeof taskEntrySchema>;

export const cancelAppointmentSchema = z.object({
	reason: z
		.string()
		.trim()
		.max(300, "Usa 300 caracteres o menos.")
		.transform((value) => value || null),
});
export type CancelAppointmentInput = z.input<typeof cancelAppointmentSchema>;

export const reportPaymentSchema = z
	.object(paymentFields)
	.superRefine(checkPaymentAmount);
export type ReportPaymentInput = z.input<typeof reportPaymentSchema>;
