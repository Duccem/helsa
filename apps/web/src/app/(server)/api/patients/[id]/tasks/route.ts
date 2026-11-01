import type { NextRequest } from "next/server";
import { taskSchema } from "@/components/dashboard/patients/schema";
import { patientErrors } from "@/lib/api/patient-errors";
import { json, readJson } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { AssignTask } from "@/lib/core/task/use-cases/assign-task";

const assignTask = new AssignTask();

export const POST = withAuth<{ id: string }>(
	async (request: NextRequest, params, ctx: AuthContext) => {
		const { id } = await params;
		const parsed = taskSchema.parse(await readJson(request));
		const task = await assignTask.execute(
			{ ...parsed, patientId: id },
			ctx.user,
		);
		return json({ ok: true, id: task.id });
	},
	patientErrors,
);
