import type { NextRequest } from "next/server";
import { noteSchema } from "@/components/dashboard/patients/schema";
import { patientErrors } from "@/lib/api/patient-errors";
import { ok, readJson } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { DeleteNote } from "@/lib/core/note/use-cases/delete-note";
import { UpdateNote } from "@/lib/core/note/use-cases/update-note";

const updateNote = new UpdateNote();
const deleteNote = new DeleteNote();

type Params = { id: string; noteId: string };

export const PUT = withAuth<Params>(
	async (request: NextRequest, params, ctx: AuthContext) => {
		const { id, noteId } = await params;
		const parsed = noteSchema.parse(await readJson(request));
		await updateNote.execute({ ...parsed, patientId: id, noteId }, ctx.user);
		return ok();
	},
	patientErrors,
);

export const DELETE = withAuth<Params>(async (_, params, ctx: AuthContext) => {
	const { id, noteId } = await params;
	await deleteNote.execute({ patientId: id, noteId }, ctx.user);
	return ok();
}, patientErrors);
