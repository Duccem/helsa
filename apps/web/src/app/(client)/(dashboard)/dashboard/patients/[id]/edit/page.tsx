import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { toDashboardRole } from "@/components/dashboard/navigation";
import { PatientForm } from "@/components/dashboard/patients/patient-form";
import { toPatientInput } from "@/components/dashboard/patients/schema";
import { PatientNotFound } from "@/lib/core/patient/domain/errors";
import { LoadPatientProfile } from "@/lib/core/patient/use-cases/load-patient-profile";
import { auth } from "@/services";

export const metadata: Metadata = { title: "Editar paciente" };

const loadPatientProfile = new LoadPatientProfile();

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user) {
		redirect("/sign-in");
	}

	if (toDashboardRole(session.user.role) === "patient") {
		redirect("/dashboard");
	}

	const { id } = await params;
	const profile = await loadPatientProfile
		.execute(id, session.user)
		.catch((error: unknown) => {
			if (error instanceof PatientNotFound) notFound();
			throw error;
		});

	return (
		<PatientForm
			mode="edit"
			patientId={profile.patient.id}
			name={profile.patient.name}
			initial={toPatientInput(profile.patient)}
		/>
	);
}
