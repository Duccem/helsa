import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { toDashboardRole } from "@/components/dashboard/navigation";
import {
	PatientProfileView,
	type ProfileTab,
	profileTabs,
} from "@/components/dashboard/patients/patient-profile";
import { PatientNotFound } from "@/lib/core/patient/domain/errors";
import { LoadPatientProfile } from "@/lib/core/patient/use-cases/load-patient-profile";
import { auth } from "@/services";

export const metadata: Metadata = { title: "Paciente" };

const loadPatientProfile = new LoadPatientProfile();

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ tab?: string | string[] }>;
}) {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user) {
		redirect("/sign-in");
	}

	if (toDashboardRole(session.user.role) === "patient") {
		redirect("/dashboard");
	}

	const [{ id }, { tab }] = await Promise.all([params, searchParams]);
	const profile = await loadPatientProfile
		.execute(id, session.user)
		.catch((error: unknown) => {
			if (error instanceof PatientNotFound) notFound();
			throw error;
		});

	const initialTab = profileTabs.includes(tab as ProfileTab)
		? (tab as ProfileTab)
		: "resumen";

	return (
		<PatientProfileView
			key={profile.patient.id}
			profile={profile}
			initialTab={initialTab}
		/>
	);
}
