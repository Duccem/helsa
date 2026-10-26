import { type NextRequest, NextResponse } from "next/server";

import { safeRedirect } from "@/lib/utils/safe-redirect";
import { auth, db } from "@/services";

/**
 * Google sends a brand-new account here when it was created from the patient
 * sign-up. Existing accounts never pass through, so nobody loses their role.
 */
export async function GET(request: NextRequest) {
	const target =
		safeRedirect(request.nextUrl.searchParams.get("redirect")) ?? "/dashboard";
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session) {
		return NextResponse.redirect(new URL("/sign-up/patient", request.url));
	}

	const { user } = session;
	if (user.role !== "patient") {
		const profile = await db.query.therapist.findFirst({
			columns: { user_id: true },
			where: { user_id: user.id },
		});
		if (!profile) {
			const context = await auth.$context;
			await context.internalAdapter.updateUser(user.id, { role: "patient" });
		}
	}

	return NextResponse.redirect(new URL(target, request.url));
}
