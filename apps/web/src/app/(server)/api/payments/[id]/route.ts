import { paymentErrors } from "@/lib/api/payment-errors";
import { ok } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { DeletePayment } from "@/lib/core/payment/use-cases/delete-payment";

const deletePayment = new DeletePayment();

export const DELETE = withAuth<{ id: string }>(
	async (_, params, ctx: AuthContext) => {
		const { id } = await params;
		await deletePayment.execute({ paymentId: id }, ctx.user);
		return ok();
	},
	paymentErrors,
);
