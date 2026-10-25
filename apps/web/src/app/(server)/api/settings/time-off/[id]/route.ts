import { and, eq } from "@helsa/db/operators";
import { availability_block } from "@helsa/db/schema/therapist";
import z from "zod";

import { fail, ok } from "@/lib/api/server";
import { requireUser } from "@/lib/api/session";
import { db } from "@/services";

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { user, error } = await requireUser(request, { therapist: true });
	if (error) return error;

	const { id } = await params;
	if (!z.uuid().safeParse(id).success) {
		return fail("Esos días ya no estaban bloqueados.", 404);
	}

	try {
		const removed = await db
			.delete(availability_block)
			.where(
				and(
					eq(availability_block.id, id),
					eq(availability_block.therapist_id, user.id),
				),
			)
			.returning({ id: availability_block.id });
		if (removed.length === 0) {
			return fail("Esos días ya no estaban bloqueados.", 404);
		}
	} catch (cause) {
		console.error("DELETE /api/settings/time-off failed", cause);
		return fail("No pudimos quitar ese bloqueo. Intenta de nuevo.", 500);
	}

	return ok();
}
