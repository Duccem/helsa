import { ok } from "@/lib/api/server";
import { videoErrors } from "@/lib/api/video-errors";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { StartVideoSession } from "@/lib/core/video/use-cases/start-video-session";

const startVideoSession = new StartVideoSession();

/** The therapist's call reports that the patient joined. */
export const POST = withAuth<{ appointmentId: string }>(
	async (_, params, ctx: AuthContext) => {
		const { appointmentId } = await params;
		await startVideoSession.execute(appointmentId, ctx.user);
		return ok();
	},
	videoErrors,
);
