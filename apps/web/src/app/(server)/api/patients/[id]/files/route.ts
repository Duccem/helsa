import type { NextRequest } from "next/server";
import { patientErrors } from "@/lib/api/patient-errors";
import { fail, json } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { UploadPatientFile } from "@/lib/core/file/use-cases/upload-patient-file";

const uploadFile = new UploadPatientFile();

export const POST = withAuth<{ id: string }>(
	async (request: NextRequest, params, ctx: AuthContext) => {
		const { id } = await params;
		const form = await request.formData().catch(() => null);
		const file = form?.get("file");
		if (!(file instanceof File)) {
			return fail("Elige un archivo.", 400);
		}

		const uploaded = await uploadFile.execute(
			{
				patientId: id,
				name: file.name,
				type: file.type,
				bytes: Buffer.from(await file.arrayBuffer()),
			},
			ctx.user,
		);
		return json({ ok: true, id: uploaded.id });
	},
	patientErrors,
);
