import type { NextRequest } from "next/server";
import { taskEntrySchema } from "@/components/dashboard/patient/schema";
import { portalErrors } from "@/lib/api/portal-errors";
import { ok, readJson } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { AnswerTask } from "@/lib/core/task/use-cases/answer-task";

const answerTask = new AnswerTask();

export const POST = withAuth<{ taskId: string }>(
	async (request: NextRequest, params, ctx: AuthContext) => {
		const { taskId } = await params;
		const parsed = taskEntrySchema.parse(await readJson(request));
		await answerTask.execute({ taskId, ...parsed }, ctx.user);
		return ok();
	},
	portalErrors,
);
