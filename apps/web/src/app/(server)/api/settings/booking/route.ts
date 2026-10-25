import { and, eq, ne } from "@helsa/db/operators";
import { therapist } from "@helsa/db/schema/therapist";

import { bookingSchema } from "@/components/dashboard/settings/schema";
import { fail, ok, readJson } from "@/lib/api/server";
import { requireUser } from "@/lib/api/session";
import { ensureTherapist } from "@/lib/settings";
import { db } from "@/services";

const TAKEN = "Ese enlace ya lo usa otra persona. Prueba con otro.";

export async function PUT(request: Request) {
	const { user, error } = await requireUser(request, { therapist: true });
	if (error) return error;

	const parsed = bookingSchema.safeParse(await readJson(request));
	if (!parsed.success) {
		return fail(parsed.error.issues[0]?.message ?? "Revisa tus reservas.", 400);
	}
	const value = parsed.data;
	const slug = value.slug || null;

	try {
		await ensureTherapist(user);
		if (slug) {
			const [owner] = await db
				.select({ user_id: therapist.user_id })
				.from(therapist)
				.where(
					and(eq(therapist.booking_slug, slug), ne(therapist.user_id, user.id)),
				)
				.limit(1);
			if (owner) return fail(TAKEN, 409);
		}
		await db
			.update(therapist)
			.set({
				booking_enabled: value.enabled,
				booking_slug: slug,
				modalities: value.modalities,
				office_address: value.officeAddress,
				booking_notice_hours: value.noticeHours,
				cancellation_notice_hours: value.cancellationHours,
			})
			.where(eq(therapist.user_id, user.id));
	} catch (cause) {
		// Two people saving the same link at once: the unique index decides.
		if ((cause as { code?: string } | null)?.code === "23505") {
			return fail(TAKEN, 409);
		}
		console.error("PUT /api/settings/booking failed", cause);
		return fail("No pudimos guardar tus reservas. Intenta de nuevo.", 500);
	}

	return ok();
}
