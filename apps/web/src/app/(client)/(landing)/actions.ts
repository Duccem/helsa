"use server";

import { waitlist_entry } from "@helsa/db/schema/waitlist";

import {
	type WaitlistInput,
	waitlistSchema,
} from "@/components/landing/waitlist-schema";
import { db } from "@/services";

export type WaitlistResult = { ok: true } | { ok: false; error: string };

export async function joinWaitlist(
	input: WaitlistInput,
): Promise<WaitlistResult> {
	const parsed = waitlistSchema.safeParse(input);

	if (!parsed.success) {
		return { ok: false, error: "Revisa los datos del formulario." };
	}

	const { name, email, profession, city } = parsed.data;

	try {
		// Re-registering with the same email is a no-op, so we don't leak who is already on the list.
		await db
			.insert(waitlist_entry)
			.values({ name, email: email.toLowerCase(), profession, city })
			.onConflictDoNothing({ target: waitlist_entry.email });
	} catch (error) {
		console.error("joinWaitlist failed", error);
		return {
			ok: false,
			error: "No pudimos registrarte. Inténtalo de nuevo en unos minutos.",
		};
	}

	// TODO: send a confirmation email.
	return { ok: true };
}
