import { patientErrors } from "@/lib/api/patient-errors";
import { ok } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { CompleteTask } from "@/lib/core/task/use-cases/complete-task";

const completeTask = new CompleteTask();

export const POST = withAuth<{ id: string; taskId: string }>(
	async (_, params, ctx: AuthContext) => {
		const { id, taskId } = await params;
		await completeTask.execute({ patientId: id, taskId }, ctx.user);
		return ok();
	},
	patientErrors,
);
