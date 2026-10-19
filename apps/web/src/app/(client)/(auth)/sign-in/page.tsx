import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { auth } from "@/services";

export const metadata: Metadata = {
	title: "Entrar · Helsa",
};

export default async function SignInPage() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (session) redirect("/dashboard");

	return <SignInForm />;
}
