import type { NextRequest } from "next/server";
import { noteSchema } from "@/components/dashboard/patients/schema";
import { patientErrors } from "@/lib/api/patient-errors";
import { json, readJson } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { CreateNote } from "@/lib/core/note/use-cases/create-note";

const createNote = new CreateNote();

export const POST = withAuth<{ id: string }>(
	async (request: NextRequest, params, ctx: AuthContext) => {
		const { id } = await params;
		const parsed = noteSchema.parse(await readJson(request));
		const note = await createNote.execute(
			{ ...parsed, patientId: id },
			ctx.user,
		);
		return json({ ok: true, id: note.id });
	},
	patientErrors,
);
