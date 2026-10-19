import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
	title: "Recuperar contraseña · Helsa",
};

export default function ForgotPasswordPage() {
	return <ForgotPasswordForm />;
}
