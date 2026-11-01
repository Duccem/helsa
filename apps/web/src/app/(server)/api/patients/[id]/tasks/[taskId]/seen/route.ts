import { patientErrors } from "@/lib/api/patient-errors";
import { ok } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { MarkTaskEntriesSeen } from "@/lib/core/task/use-cases/mark-task-entries-seen";

const markSeen = new MarkTaskEntriesSeen();

export const POST = withAuth<{ id: string; taskId: string }>(
	async (_, params, ctx: AuthContext) => {
		const { id, taskId } = await params;
		await markSeen.execute({ patientId: id, taskId }, ctx.user);
		return ok();
	},
	patientErrors,
);
