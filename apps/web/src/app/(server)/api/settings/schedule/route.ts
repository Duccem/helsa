import { eq } from "@helsa/db/operators";
import { availability_rule, therapist } from "@helsa/db/schema/therapist";

import { scheduleSchema } from "@/components/dashboard/settings/schema";
import { fail, ok, readJson } from "@/lib/api/server";
import { requireUser } from "@/lib/api/session";
import { ensureTherapist, toDbWeekday } from "@/lib/settings";
import { db } from "@/services";

/** Replaces the whole weekly schedule; it is small and always edited as one. */
export async function PUT(request: Request) {
	const { user, error } = await requireUser(request, { therapist: true });
	if (error) return error;

	const parsed = scheduleSchema.safeParse(await readJson(request));
	if (!parsed.success) {
		return fail(parsed.error.issues[0]?.message ?? "Revisa tu horario.", 400);
	}
	const value = parsed.data;

	try {
		await ensureTherapist(user);
		await db.transaction(async (tx) => {
			await tx
				.update(therapist)
				.set({
					timezone: value.timezone,
					default_session_minutes: value.sessionMinutes,
					default_buffer_minutes: value.bufferMinutes,
				})
				.where(eq(therapist.user_id, user.id));
			await tx
				.delete(availability_rule)
				.where(eq(availability_rule.therapist_id, user.id));
			if (value.ranges.length > 0) {
				await tx.insert(availability_rule).values(
					value.ranges.map((range) => ({
						therapist_id: user.id,
						weekday: toDbWeekday(range.weekday),
						start_time: `${range.start}:00`,
						end_time: `${range.end}:00`,
					})),
				);
			}
		});
	} catch (cause) {
		console.error("PUT /api/settings/schedule failed", cause);
		return fail("No pudimos guardar tu horario. Intenta de nuevo.", 500);
	}

	return ok();
}
