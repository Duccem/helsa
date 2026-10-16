"use server";

import {
	type WaitlistInput,
	waitlistSchema,
} from "@/components/landing/waitlist-schema";

export type WaitlistResult = { ok: true } | { ok: false; error: string };

export async function joinWaitlist(
	input: WaitlistInput,
): Promise<WaitlistResult> {
	const parsed = waitlistSchema.safeParse(input);

	if (!parsed.success) {
		return { ok: false, error: "Revisa los datos del formulario." };
	}

	// TODO: persist `parsed.data` (e.g. a `waitlist` table in @helsa/db) and send a confirmation email.
	return { ok: true };
}
