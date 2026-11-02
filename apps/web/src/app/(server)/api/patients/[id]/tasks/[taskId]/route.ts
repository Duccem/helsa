import type { NextRequest } from "next/server";
import { taskSchema } from "@/components/dashboard/patients/schema";
import { patientErrors } from "@/lib/api/patient-errors";
import { ok, readJson } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { UpdateTask } from "@/lib/core/task/use-cases/update-task";

const updateTask = new UpdateTask();

export const PUT = withAuth<{ id: string; taskId: string }>(
	async (request: NextRequest, params, ctx: AuthContext) => {
		const { id, taskId } = await params;
		const parsed = taskSchema.parse(await readJson(request));
		await updateTask.execute({ ...parsed, patientId: id, taskId }, ctx.user);
		return ok();
	},
	patientErrors,
);
