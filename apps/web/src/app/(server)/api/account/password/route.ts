import { APIError } from "better-auth/api";
import z from "zod";

import { fail, ok, readJson } from "@/lib/api/server";
import { auth } from "@/services";

const schema = z.object({ newPassword: z.string().min(8).max(128) });

/**
 * Better Auth only lets the server add a password, so an account that signs
 * in with Google can also enter with email and password afterwards.
 */
export async function POST(request: Request) {
	const parsed = schema.safeParse(await readJson(request));
	if (!parsed.success) {
		return fail("Usa entre 8 y 128 caracteres.", 400);
	}

	try {
		await auth.api.setPassword({
			body: { newPassword: parsed.data.newPassword },
			headers: request.headers,
		});
	} catch (error) {
		if (error instanceof APIError) {
			if (error.body?.code === "PASSWORD_ALREADY_SET") {
				return fail("Tu cuenta ya tiene contraseña. Recarga la página.", 409);
			}
			if (error.status === "UNAUTHORIZED") {
				return fail("Tu sesión venció. Vuelve a entrar.", 401);
			}
		}
		console.error("POST /api/account/password failed", error);
		return fail("No pudimos guardar la contraseña. Intenta de nuevo.", 500);
	}

	return ok();
}
