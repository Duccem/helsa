import { eq } from "@helsa/db/operators";
import { therapist, therapist_rate } from "@helsa/db/schema/therapist";

import { pricingSchema } from "@/components/dashboard/settings/schema";
import { fail, ok, readJson } from "@/lib/api/server";
import { requireUser } from "@/lib/api/session";
import { ensureTherapist } from "@/lib/settings";
import { db } from "@/services";

export async function PUT(request: Request) {
	const { user, error } = await requireUser(request, { therapist: true });
	if (error) return error;

	const parsed = pricingSchema.safeParse(await readJson(request));
	if (!parsed.success) {
		return fail(parsed.error.issues[0]?.message ?? "Revisa tus precios.", 400);
	}
	const value = parsed.data;
	// The first active price is what a new appointment costs unless chosen otherwise.
	const main = value.rates.find((rate) => rate.isActive) ?? value.rates[0];

	try {
		await ensureTherapist(user);
		await db.transaction(async (tx) => {
			await tx
				.update(therapist)
				.set({
					default_price_usd: main ? main.priceUsd.toFixed(2) : null,
					payment_methods: value.paymentMethods,
					payment_instructions: value.paymentInstructions,
				})
				.where(eq(therapist.user_id, user.id));
			// Nothing references a rate (appointments freeze their own price).
			await tx
				.delete(therapist_rate)
				.where(eq(therapist_rate.therapist_id, user.id));
			await tx.insert(therapist_rate).values(
				value.rates.map((rate, position) => ({
					therapist_id: user.id,
					name: rate.name,
					duration_minutes: rate.durationMinutes,
					price_usd: rate.priceUsd.toFixed(2),
					modality: rate.modality,
					is_active: rate.isActive,
					position,
				})),
			);
		});
	} catch (cause) {
		console.error("PUT /api/settings/pricing failed", cause);
		return fail("No pudimos guardar tus precios. Intenta de nuevo.", 500);
	}

	return ok();
}
