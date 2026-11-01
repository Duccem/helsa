import type { Metadata, Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { safeRedirect } from "@/lib/utils/safe-redirect";
import { auth } from "@/services";

export const metadata: Metadata = {
	title: "Entrar · Helsa",
};

export default async function SignInPage({
	searchParams,
}: {
	searchParams: Promise<{ redirect?: string }>;
}) {
	const next = safeRedirect((await searchParams).redirect);
	const session = await auth.api.getSession({ headers: await headers() });
	if (session) redirect((next ?? "/dashboard") as Route);

	return <SignInForm redirectTo={next} />;
}
