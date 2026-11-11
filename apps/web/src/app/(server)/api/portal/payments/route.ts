import type { NextRequest } from "next/server";
import { reportPaymentSchema } from "@/components/dashboard/patient/schema";
import { portalErrors } from "@/lib/api/portal-errors";
import { fail, json } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { ReportPayment } from "@/lib/core/payment/use-cases/report-payment";

const reportPayment = new ReportPayment();

/** Multipart: `data` holds the payment as JSON, `proof` the optional receipt. */
export const POST = withAuth(
	async (request: NextRequest, _, ctx: AuthContext) => {
		const form = await request.formData().catch(() => null);
		const raw = form?.get("data");
		if (typeof raw !== "string") {
			return fail("Faltan los datos del pago.", 400);
		}

		let body: unknown;
		try {
			body = JSON.parse(raw);
		} catch {
			return fail("Faltan los datos del pago.", 400);
		}
		const parsed = reportPaymentSchema.parse(body);

		const file = form?.get("proof");
		const proof =
			file instanceof File && file.size > 0
				? {
						name: file.name,
						type: file.type,
						bytes: Buffer.from(await file.arrayBuffer()),
					}
				: null;

		const result = await reportPayment.execute({ ...parsed, proof }, ctx.user);
		return json({ ok: true, ...result });
	},
	portalErrors,
);
