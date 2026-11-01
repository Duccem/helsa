import type { NextRequest } from "next/server";
import { bookingRequestSchema } from "@/components/booking/schema";
import {
	domainError,
	internalServerError,
	json,
	readJson,
} from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import {
	BookingPageNotFound,
	InvalidBookingOption,
	OwnBookingPage,
	PatientAccountRequired,
	SlotUnavailable,
} from "@/lib/core/booking/domain/errors";
import { BookAppointment } from "@/lib/core/booking/use-cases/book-appointment";
import type { CommonError } from "@/lib/utils/error";

const bookAppointment = new BookAppointment();

export const POST = withAuth<{ slug: string }>(
	async (request: NextRequest, params, ctx: AuthContext) => {
		const { slug } = await params;
		const parsed = bookingRequestSchema.parse(await readJson(request));
		const booking = await bookAppointment.execute(
			{ ...parsed, slug },
			ctx.user,
		);
		return json({ ok: true, booking });
	},
	(error: CommonError) => {
		switch (true) {
			case error instanceof BookingPageNotFound:
				return domainError(error, 404);
			case error instanceof PatientAccountRequired:
				return domainError(error, 403);
			case error instanceof SlotUnavailable:
				return domainError(error, 409);
			case error instanceof InvalidBookingOption:
			case error instanceof OwnBookingPage:
				return domainError(error, 400);
			default:
				return internalServerError();
		}
	},
);
