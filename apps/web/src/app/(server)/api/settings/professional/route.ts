import { eq } from "@helsa/db/operators";
import { therapist } from "@helsa/db/schema/therapist";

import { professionalSchema } from "@/components/dashboard/settings/schema";
import { fail, ok, readJson } from "@/lib/api/server";
import { requireUser } from "@/lib/api/session";
import { ensureTherapist } from "@/lib/settings";
import { db } from "@/services";

export async function PUT(request: Request) {
	const { user, error } = await requireUser(request, { therapist: true });
	if (error) return error;

	const parsed = professionalSchema.safeParse(await readJson(request));
	if (!parsed.success) {
		return fail(parsed.error.issues[0]?.message ?? "Revisa los datos.", 400);
	}
	const value = parsed.data;

	try {
		await ensureTherapist(user);
		const [current] = await db
			.select({ license_number: therapist.license_number })
			.from(therapist)
			.where(eq(therapist.user_id, user.id))
			.limit(1);
		// A new license number has to be checked again.
		const licenseChanged =
			(current?.license_number ?? null) !== value.licenseNumber;

		await db
			.update(therapist)
			.set({
				display_name: value.displayName,
				professional_title: value.professionalTitle,
				license_number: value.licenseNumber,
				license_body: value.licenseBody,
				years_experience: value.yearsExperience,
				bio: value.bio,
				specialties: [...new Set(value.specialties)],
				languages: value.languages,
				phone_e164: value.phone,
				country_code: value.countryCode,
				...(licenseChanged
					? { license_verified_at: null, license_verified_by: null }
					: {}),
			})
			.where(eq(therapist.user_id, user.id));
	} catch (cause) {
		console.error("PUT /api/settings/professional failed", cause);
		return fail("No pudimos guardar tu perfil. Intenta de nuevo.", 500);
	}

	return ok();
}
