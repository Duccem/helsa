import { domainError, internalServerError, ok } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { TherapistNotFound } from "@/lib/core/therapist/domain/errors";
import { RemoveTimeOff } from "@/lib/core/therapist/use-cases/remove-time-off";

const removeTimeOff = new RemoveTimeOff();

export const DELETE = withAuth<{ id: string }>(
	async (_, params, ctx: AuthContext) => {
		const { id } = await params;
		await removeTimeOff.execute(id, ctx.user);
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
