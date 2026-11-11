import type { NextRequest } from "next/server";
import { cancelAppointmentSchema } from "@/components/dashboard/patient/schema";
import { portalErrors } from "@/lib/api/portal-errors";
import { ok, readJson } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { CancelPatientAppointment } from "@/lib/core/appointment/use-cases/cancel-patient-appointment";

const cancelAppointment = new CancelPatientAppointment();

export const POST = withAuth<{ id: string }>(
	async (request: NextRequest, params, ctx: AuthContext) => {
		const { id } = await params;
		const { reason } = cancelAppointmentSchema.parse(
			(await readJson(request)) ?? {},
		);
		await cancelAppointment.execute({ appointmentId: id, reason }, ctx.user);
		return ok();
	},
	portalErrors,
);
