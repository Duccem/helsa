import type { NextRequest } from "next/server";
import { recordPaymentSchema } from "@/components/dashboard/payments/schema";
import { paymentErrors } from "@/lib/api/payment-errors";
import { json, readJson } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { RecordPayment } from "@/lib/core/payment/use-cases/record-payment";

const recordPayment = new RecordPayment();

export const POST = withAuth(
	async (request: NextRequest, _, ctx: AuthContext) => {
		const parsed = recordPaymentSchema.parse(await readJson(request));
		const result = await recordPayment.execute(parsed, ctx.user);
		return json({ ok: true, ...result });
	},
	paymentErrors,
);
