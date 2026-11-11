import { portalErrors } from "@/lib/api/portal-errors";
import { ok } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { ConfirmPatientAppointment } from "@/lib/core/appointment/use-cases/confirm-patient-appointment";

const confirmAppointment = new ConfirmPatientAppointment();

export const POST = withAuth<{ id: string }>(
	async (_, params, ctx: AuthContext) => {
		const { id } = await params;
		await confirmAppointment.execute(id, ctx.user);
		return ok();
	},
	portalErrors,
);
