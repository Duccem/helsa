import { patientErrors } from "@/lib/api/patient-errors";
import { ok } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { CancelTask } from "@/lib/core/task/use-cases/cancel-task";

const cancelTask = new CancelTask();

export const POST = withAuth<{ id: string; taskId: string }>(
	async (_, params, ctx: AuthContext) => {
		const { id, taskId } = await params;
		await cancelTask.execute({ patientId: id, taskId }, ctx.user);
		return ok();
	},
	patientErrors,
);
