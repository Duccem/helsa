import z from "zod";

/** What the booking page sends when the patient confirms. */
export const bookingRequestSchema = z.object({
	rateId: z.string().min(1).max(64),
	modality: z.enum(["video", "in_person", "phone"]),
	startsAt: z.iso.datetime({ offset: true }),
	paymentMethod: z.string().max(40).nullable(),
});
export type BookingRequest = z.infer<typeof bookingRequestSchema>;
