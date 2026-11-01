import { patientErrors } from "@/lib/api/patient-errors";
import { ok } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { SignNote } from "@/lib/core/note/use-cases/sign-note";

const signNote = new SignNote();

export const POST = withAuth<{ id: string; noteId: string }>(
	async (_, params, ctx: AuthContext) => {
		const { id, noteId } = await params;
		await signNote.execute({ patientId: id, noteId }, ctx.user);
		return ok();
	},
	patientErrors,
);
