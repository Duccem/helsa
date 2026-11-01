import type { NextRequest } from "next/server";
import { patientSchema } from "@/components/dashboard/patients/schema";
import { patientErrors } from "@/lib/api/patient-errors";
import { ok, readJson } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { UpdatePatient } from "@/lib/core/patient/use-cases/update-patient";

const updatePatient = new UpdatePatient();

export const PUT = withAuth<{ id: string }>(
	async (request: NextRequest, params, ctx: AuthContext) => {
		const { id } = await params;
		const parsed = patientSchema.parse(await readJson(request));
		await updatePatient.execute({ ...parsed, patientId: id }, ctx.user);
		return ok();
	},
	patientErrors,
);
