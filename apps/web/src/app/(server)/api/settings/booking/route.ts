import type { NextRequest } from "next/server";
import { bookingSchema } from "@/components/dashboard/settings/schema";
import { domainError, internalServerError, ok, readJson } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { SlugAlreadyTaken, TherapistNotFound } from "@/lib/core/therapist/domain/errors";
import { SaveBookingInfo } from "@/lib/core/therapist/use-cases/save-booking-info";

const saveBooking = new SaveBookingInfo();

export const PUT = withAuth(
	async (request: NextRequest, _, ctx: AuthContext) => {
		const user = ctx.user;
		const parsed = bookingSchema.parse(await readJson(request));

		await saveBooking.execute(parsed, user);

		return ok()
	},
	(error: TherapistNotFound | SlugAlreadyTaken) => {
		switch (true) {
			case error instanceof TherapistNotFound:
				return domainError(error, 404);
			case error instanceof SlugAlreadyTaken:
				return domainError(error, 400)
			default:
				return internalServerError();
		}
	}
)
