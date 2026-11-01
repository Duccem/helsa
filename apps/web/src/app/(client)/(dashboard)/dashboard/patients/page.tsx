import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { toDashboardRole } from "@/components/dashboard/navigation";
import { PatientsList } from "@/components/dashboard/patients/patients-list";
import { ListPatients } from "@/lib/core/patient/use-cases/list-patients";
import { auth } from "@/services";

export const metadata: Metadata = { title: "Pacientes" };

const listPatients = new ListPatients();

export default async function Page() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user) {
		redirect("/sign-in");
	}

	if (toDashboardRole(session.user.role) === "patient") {
		redirect("/dashboard");
	}

	return <PatientsList data={await listPatients.execute(session.user)} />;
}
