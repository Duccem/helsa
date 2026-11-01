import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { toDashboardRole } from "@/components/dashboard/navigation";
import { PatientForm } from "@/components/dashboard/patients/patient-form";
import { emptyPatient } from "@/components/dashboard/patients/schema";
import { auth } from "@/services";

export const metadata: Metadata = { title: "Nuevo paciente" };

export default async function Page() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user) {
		redirect("/sign-in");
	}

	if (toDashboardRole(session.user.role) === "patient") {
		redirect("/dashboard");
	}

	return <PatientForm mode="create" initial={emptyPatient} />;
}
