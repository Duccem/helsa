import { json } from "@/lib/api/server";
import { videoErrors } from "@/lib/api/video-errors";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { EndVideoSession } from "@/lib/core/video/use-cases/end-video-session";

const endVideoSession = new EndVideoSession();

/** The therapist ends the session for everyone. */
export const POST = withAuth<{ appointmentId: string }>(
	async (_, params, ctx: AuthContext) => {
		const { appointmentId } = await params;
		const result = await endVideoSession.execute(appointmentId, ctx.user);
		return json({ ok: true, completed: result.completed });
	},
	videoErrors,
);
