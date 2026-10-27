import type { NextRequest } from "next/server";
import { notificationsSchema } from "@/components/dashboard/settings/schema";
import { domainError, internalServerError, ok, readJson } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { SaveNotificationsSettings } from "@/lib/core/settings/use-cases/save-notifications";
import { TherapistNotFound } from "@/lib/core/therapist/domain/errors";

const saveNotificationsSettings = new SaveNotificationsSettings();

export const PUT = withAuth(
	async (request: NextRequest, _, ctx: AuthContext) => {
		const parsed = notificationsSchema.parse(await readJson(request));

		await saveNotificationsSettings.execute(parsed, ctx.user);
		return ok()
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

