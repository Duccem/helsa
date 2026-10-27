import type { NextRequest } from "next/server";
import { pricingSchema } from "@/components/dashboard/settings/schema";
import { domainError, internalServerError, ok, readJson } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { TherapistNotFound } from "@/lib/core/therapist/domain/errors";
import { SavePaymentRates } from "@/lib/core/therapist/use-cases/save-payment-rates";

const savePaymentRates = new SavePaymentRates();

export const PUT = withAuth(
	async (request: NextRequest, _, ctx: AuthContext) => {
		const parsed = pricingSchema.parse(await readJson(request));
		await savePaymentRates.execute(parsed, ctx.user);

		return ok();
	},
	(error: TherapistNotFound) => {
		switch (true) {
			case error instanceof TherapistNotFound:
				return domainError(error, 404)
			default:
				return internalServerError();
		}
	}
)
