import { and, eq, gte, inArray, lt, sql } from "@helsa/db/operators";
import { appointment } from "@helsa/db/schema/appointment";
import { availability_block, therapist } from "@helsa/db/schema/therapist";

import { timeOffSchema } from "@/components/dashboard/settings/schema";
import { fail, ok, readJson } from "@/lib/api/server";
import { requireUser } from "@/lib/api/session";
import { ensureTherapist } from "@/lib/settings";
import { addDays, startOfZonedDay } from "@/lib/utils/zoned-time";
import { db } from "@/services";

/**
 * Blocks whole days in the therapist's time zone and says how many booked
 * sessions fall inside them, so they can be moved.
 */
export async function POST(request: Request) {
	const { user, error } = await requireUser(request, { therapist: true });
	if (error) return error;

	const parsed = timeOffSchema.safeParse(await readJson(request));
	if (!parsed.success) {
		return fail(parsed.error.issues[0]?.message ?? "Revisa las fechas.", 400);
	}
	const value = parsed.data;

	try {
		await ensureTherapist(user);
		const [profile] = await db
			.select({ timezone: therapist.timezone })
			.from(therapist)
			.where(eq(therapist.user_id, user.id))
			.limit(1);
		const timezone = profile?.timezone ?? "America/Caracas";
		const startsAt = startOfZonedDay(value.startsOn, timezone);
		// Stored as the midnight after the last day off.
		const endsAt = startOfZonedDay(addDays(value.endsOn, 1), timezone);

		const [[created], [affected]] = await Promise.all([
			db
				.insert(availability_block)
				.values({
					therapist_id: user.id,
					starts_at: startsAt,
					ends_at: endsAt,
					reason: value.reason,
				})
				.returning({ id: availability_block.id }),
			db
				.select({ count: sql<number>`count(*)::int` })
				.from(appointment)
				.where(
					and(
						eq(appointment.therapist_id, user.id),
						inArray(appointment.status, ["scheduled", "confirmed"]),
						gte(appointment.starts_at, startsAt),
						lt(appointment.starts_at, endsAt),
					),
				),
		]);

		return ok({ id: created?.id ?? "", affected: affected?.count ?? 0 });
	} catch (cause) {
		console.error("POST /api/settings/time-off failed", cause);
		return fail("No pudimos bloquear esos días. Intenta de nuevo.", 500);
	}
}
