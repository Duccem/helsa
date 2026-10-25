import { preferencesSchema } from "@/components/dashboard/settings/schema";
import { fail, ok, readJson } from "@/lib/api/server";
import { requireUser } from "@/lib/api/session";
import { saveUserSettings } from "@/lib/settings";

/** Open to every role: patients have app preferences too. */
export async function PUT(request: Request) {
	const { user, error } = await requireUser(request);
	if (error) return error;

	const parsed = preferencesSchema.safeParse(await readJson(request));
	if (!parsed.success) {
		return fail(
			parsed.error.issues[0]?.message ?? "Revisa tus preferencias.",
			400,
		);
	}

	try {
		await saveUserSettings(user.id, { preferences: parsed.data });
	} catch (cause) {
		console.error("PUT /api/settings/preferences failed", cause);
		return fail("No pudimos guardar tus preferencias. Intenta de nuevo.", 500);
	}

	return ok();
}
