import { waitlist_entry } from "@helsa/db/schema/waitlist";

import { waitlistSchema } from "@/components/landing/waitlist-schema";
import { fail, ok, readJson } from "@/lib/api/server";
import { db } from "@/services";

export async function POST(request: Request) {
	const parsed = waitlistSchema.safeParse(await readJson(request));
	if (!parsed.success) {
		return fail("Revisa los datos del formulario.", 400);
	}

	const { name, email, profession, city } = parsed.data;

	try {
		// Re-registering with the same email is a no-op, so we don't leak who is already on the list.
		await db
			.insert(waitlist_entry)
			.values({ name, email: email.toLowerCase(), profession, city })
			.onConflictDoNothing({ target: waitlist_entry.email });
	} catch (error) {
		console.error("POST /api/waitlist failed", error);
		return fail(
			"No pudimos registrarte. Inténtalo de nuevo en unos minutos.",
			500,
		);
	}

	// TODO: send a confirmation email.
	return ok();
}
