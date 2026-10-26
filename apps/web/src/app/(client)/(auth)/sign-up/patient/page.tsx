import type { Metadata, Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PatientSignUpForm } from "@/components/auth/patient-sign-up-form";
import { safeRedirect } from "@/lib/utils/safe-redirect";
import { auth, db } from "@/services";

export const metadata: Metadata = {
	title: "Crear cuenta de paciente · Helsa",
};

export default async function PatientSignUpPage({
	searchParams,
}: {
	searchParams: Promise<{ redirect?: string; therapist?: string }>;
}) {
	const params = await searchParams;
	const next = safeRedirect(params.redirect);

	const session = await auth.api.getSession({ headers: await headers() });
	if (session) redirect((next ?? "/dashboard") as Route);

	const therapist = params.therapist
		? await db.query.therapist.findFirst({
				columns: { display_name: true },
				where: { booking_slug: params.therapist, booking_enabled: true },
			})
		: undefined;

	return (
		<PatientSignUpForm
			redirectTo={next}
			therapistName={therapist?.display_name}
		/>
	);
}
