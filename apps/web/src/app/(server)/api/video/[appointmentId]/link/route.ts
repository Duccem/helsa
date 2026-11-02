import { json } from "@/lib/api/server";
import { videoErrors } from "@/lib/api/video-errors";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { LoadGuestLink } from "@/lib/core/video/use-cases/load-guest-link";

const loadGuestLink = new LoadGuestLink();

/** The patient's join link. POST because it may create the room. */
export const POST = withAuth<{ appointmentId: string }>(
	async (_, params, ctx: AuthContext) => {
		const { appointmentId } = await params;
		const link = await loadGuestLink.execute(appointmentId, ctx.user);
		return json({ ok: true, url: link.url });
	},
	videoErrors,
);
