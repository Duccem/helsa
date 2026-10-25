"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import z from "zod";

import { auth } from "@/services";

export type SetPasswordResult = { ok: true } | { ok: false; error: string };

const schema = z.string().min(8).max(128);

/**
 * Better Auth only lets the server add a password, so an account that signs
 * in with Google can also enter with email and password afterwards.
 */
export async function setAccountPassword(
	newPassword: string,
): Promise<SetPasswordResult> {
	const parsed = schema.safeParse(newPassword);
	if (!parsed.success) {
		return { ok: false, error: "Usa entre 8 y 128 caracteres." };
	}

	try {
		await auth.api.setPassword({
			body: { newPassword: parsed.data },
			headers: await headers(),
		});
	} catch (error) {
		if (error instanceof APIError) {
			if (error.body?.code === "PASSWORD_ALREADY_SET") {
				return {
					ok: false,
					error: "Tu cuenta ya tiene contraseña. Recarga la página.",
				};
			}
			if (error.status === "UNAUTHORIZED") {
				return { ok: false, error: "Tu sesión venció. Vuelve a entrar." };
			}
		}
		console.error("setAccountPassword failed", error);
		return {
			ok: false,
			error: "No pudimos guardar la contraseña. Intenta de nuevo.",
		};
	}

	return { ok: true };
}
