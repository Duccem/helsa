import type { NextRequest } from "next/server";
import { professionalSchema } from "@/components/dashboard/settings/schema";
import { domainError, internalServerError, ok, readJson } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { TherapistNotFound } from "@/lib/core/therapist/domain/errors";
import { SaveProfessional } from "@/lib/core/therapist/use-cases/save-professional";

const saveProfessional = new SaveProfessional();

export const PUT = withAuth(
	async (request: NextRequest, _, ctx: AuthContext) => {
		const parsed = professionalSchema.parse(await readJson(request));

		await saveProfessional.execute(parsed, ctx.user);

		return ok();
	},
	(error: TherapistNotFound) => {
		switch (true) {
			case error instanceof TherapistNotFound:
				return domainError(error, 404);
			default:
				return internalServerError();
		}
	}
)
