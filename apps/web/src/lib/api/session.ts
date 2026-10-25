import { toDashboardRole } from "@/components/dashboard/navigation";
import { auth } from "@/services";

import { fail } from "./server";

type SessionUser = { id: string; name: string; email: string; role: string };

/**
 * The signed-in user, or the response to send instead. Pass `therapist` for
 * routes that change the professional profile.
 */
export async function requireUser(
	request: Request,
	options: { therapist?: boolean } = {},
): Promise<
	{ user: SessionUser; error?: never } | { user?: never; error: Response }
> {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		return { error: fail("Tu sesión venció. Vuelve a entrar.", 401) };
	}
	const role = toDashboardRole(session.user.role);
	if (options.therapist && role !== "therapist") {
		return { error: fail("Esta parte es solo para terapeutas.", 403) };
	}
	return {
		user: {
			id: session.user.id,
			name: session.user.name,
			email: session.user.email,
			role,
		},
	};
}
