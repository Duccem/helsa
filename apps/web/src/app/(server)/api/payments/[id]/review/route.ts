import type { NextRequest } from "next/server";
import { reviewPaymentSchema } from "@/components/dashboard/payments/schema";
import { paymentErrors } from "@/lib/api/payment-errors";
import { ok, readJson } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { ReviewPayment } from "@/lib/core/payment/use-cases/review-payment";

const reviewPayment = new ReviewPayment();

export const POST = withAuth<{ id: string }>(
	async (request: NextRequest, params, ctx: AuthContext) => {
		const { id } = await params;
		const parsed = reviewPaymentSchema.parse(await readJson(request));
		await reviewPayment.execute({ ...parsed, paymentId: id }, ctx.user);
		return ok();
	},
	paymentErrors,
);
