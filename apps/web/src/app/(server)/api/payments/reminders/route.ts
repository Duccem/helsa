import type { NextRequest } from "next/server";
import { sendReminderSchema } from "@/components/dashboard/payments/schema";
import { paymentErrors } from "@/lib/api/payment-errors";
import { json, readJson } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { SendPaymentReminder } from "@/lib/core/payment/use-cases/send-payment-reminder";

const sendReminder = new SendPaymentReminder();

/** Answers `{ status: "sent" }` or `{ status: "handoff", url }` for the therapist to open. */
export const POST = withAuth(
	async (request: NextRequest, _, ctx: AuthContext) => {
		const parsed = sendReminderSchema.parse(await readJson(request));
		const delivery = await sendReminder.execute(parsed, ctx.user);
		return json({ ok: true, ...delivery });
	},
	paymentErrors,
);
