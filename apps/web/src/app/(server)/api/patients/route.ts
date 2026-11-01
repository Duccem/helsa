import type { NextRequest } from "next/server";
import { patientSchema } from "@/components/dashboard/patients/schema";
import { patientErrors } from "@/lib/api/patient-errors";
import { json, readJson } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { CreatePatient } from "@/lib/core/patient/use-cases/create-patient";

const createPatient = new CreatePatient();

export const POST = withAuth(
	async (request: NextRequest, _, ctx: AuthContext) => {
		const parsed = patientSchema.parse(await readJson(request));
		const { id } = await createPatient.execute(parsed, ctx.user);
		return json({ ok: true, id });
	},
	patientErrors,
);
