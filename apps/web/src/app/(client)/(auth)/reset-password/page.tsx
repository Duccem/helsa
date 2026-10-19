import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
	title: "Nueva contraseña · Helsa",
};

export default async function ResetPasswordPage({
	searchParams,
}: {
	searchParams: Promise<{
		token?: string | string[];
		error?: string | string[];
	}>;
}) {
	const { token, error } = await searchParams;
	const validToken = !error && typeof token === "string" ? token : null;

	return <ResetPasswordForm token={validToken} />;
}
