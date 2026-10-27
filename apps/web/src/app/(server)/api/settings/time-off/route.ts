import type { NextRequest } from "next/server";
import { timeOffSchema } from "@/components/dashboard/settings/schema";
import { domainError, internalServerError, ok, readJson } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { TherapistNotFound } from "@/lib/core/therapist/domain/errors";
import { SaveTimeOff } from "@/lib/core/therapist/use-cases/save-time-off";

const saveTimeOff = new SaveTimeOff();

export const POST = withAuth(
	async (request: NextRequest, _, ctx: AuthContext) => {
		const parsed = timeOffSchema.parse(await readJson(request));

		await saveTimeOff.execute(parsed, ctx.user);

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