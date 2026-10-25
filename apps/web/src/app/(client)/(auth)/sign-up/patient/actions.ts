"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";

import {
	type SignUpInput,
	signUpSchema,
} from "@/components/auth/sign-up-schema";
import { auth } from "@/services";

export type PatientSignUpResult = { ok: true } | { ok: false; error: string };

const ALREADY_EXISTS = new Set([
	"USER_ALREADY_EXISTS",
	"USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
]);

/**
 * Creates the account on the server so the role never comes from the browser:
 * whoever signs up here is a patient, everyone else defaults to therapist.
 */
export async function signUpPatient(
	input: SignUpInput,
): Promise<PatientSignUpResult> {
	const parsed = signUpSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "Revisa los datos del formulario." };
	}

	try {
		const { user } = await auth.api.signUpEmail({
			body: {
				name: parsed.data.name,
				email: parsed.data.email,
				password: parsed.data.password,
			},
			headers: await headers(),
		});
		const context = await auth.$context;
		await context.internalAdapter.updateUser(user.id, { role: "patient" });
	} catch (error) {
		if (
			error instanceof APIError &&
			ALREADY_EXISTS.has(error.body?.code ?? "")
		) {
			return {
				ok: false,
				error: "Ya existe una cuenta con ese correo. Prueba a entrar.",
			};
		}
		console.error("signUpPatient failed", error);
		return {
			ok: false,
			error: "No pudimos crear tu cuenta. Intenta de nuevo.",
		};
	}

	return { ok: true };
}
