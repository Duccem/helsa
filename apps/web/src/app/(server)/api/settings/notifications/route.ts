import { eq } from "@helsa/db/operators";
import { therapist } from "@helsa/db/schema/therapist";

import { notificationsSchema } from "@/components/dashboard/settings/schema";
import { fail, ok, readJson } from "@/lib/api/server";
import { requireUser } from "@/lib/api/session";
import { ensureTherapist, saveUserSettings } from "@/lib/settings";
import { db } from "@/services";

export async function PUT(request: Request) {
	const { user, error } = await requireUser(request, { therapist: true });
	if (error) return error;

	const parsed = notificationsSchema.safeParse(await readJson(request));
	if (!parsed.success) {
		return fail(parsed.error.issues[0]?.message ?? "Revisa tus avisos.", 400);
	}
	const { remindersEnabled, ...notifications } = parsed.data;

	try {
		await ensureTherapist(user);
		await Promise.all([
			db
				.update(therapist)
				.set({ reminders_enabled: remindersEnabled })
				.where(eq(therapist.user_id, user.id)),
			saveUserSettings(user.id, { notifications }),
		]);
	} catch (cause) {
		console.error("PUT /api/settings/notifications failed", cause);
		return fail("No pudimos guardar tus avisos. Intenta de nuevo.", 500);
	}

	return ok();
}
