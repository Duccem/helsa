import { APIError } from "better-auth/api";

import { signUpSchema } from "@/components/auth/sign-up-schema";
import { fail, ok, readJson } from "@/lib/api/server";
import { auth } from "@/services";

const ALREADY_EXISTS = new Set([
	"USER_ALREADY_EXISTS",
	"USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
]);

/**
 * Creates the account on the server so the role never comes from the browser:
 * whoever signs up here is a patient, everyone else defaults to therapist.
 */
export async function POST(request: Request) {
	const parsed = signUpSchema.safeParse(await readJson(request));
	if (!parsed.success) {
		return fail("Revisa los datos del formulario.", 400);
	}

	try {
		const { user } = await auth.api.signUpEmail({
			body: {
				name: parsed.data.name,
				email: parsed.data.email,
				password: parsed.data.password,
			},
			headers: request.headers,
		});
		const context = await auth.$context;
		await context.internalAdapter.updateUser(user.id, { role: "patient" });
	} catch (error) {
		if (
			error instanceof APIError &&
			ALREADY_EXISTS.has(error.body?.code ?? "")
		) {
			return fail("Ya existe una cuenta con ese correo. Prueba a entrar.", 409);
		}
		console.error("POST /api/sign-up/patient failed", error);
		return fail("No pudimos crear tu cuenta. Intenta de nuevo.", 500);
	}

	return ok();
}
