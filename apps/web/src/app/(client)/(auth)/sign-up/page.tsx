import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SignUpForm } from "@/components/auth/sign-up-form";
import { auth } from "@/services";

export const metadata: Metadata = {
	title: "Crear cuenta · Helsa",
};

export default async function SignUpPage() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (session) redirect("/dashboard");

	return <SignUpForm />;
}
