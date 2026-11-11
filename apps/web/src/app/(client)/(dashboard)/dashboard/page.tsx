import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { toDashboardRole } from "@/components/dashboard/navigation";
import { NotLinked } from "@/components/dashboard/patient/not-linked";
import { PatientDashboard } from "@/components/dashboard/patient/patient-dashboard";
import { TherapistDashboard } from "@/components/dashboard/therapist/therapist-dashboard";
import { LoadPatientHome } from "@/lib/core/patient/use-cases/load-patient-home";
import { LoadTherapistHome } from "@/lib/core/therapist/use-cases/load-therapist-home";
import { auth } from "@/services";

const loadTherapistHome = new LoadTherapistHome();
const loadPatientHome = new LoadPatientHome();

export default async function DashboardPage() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user) {
		redirect("/sign-in");
	}

	if (toDashboardRole(session.user.role) === "patient") {
		const patientHome = await loadPatientHome.execute(session.user);
		if (!patientHome) {
			return <NotLinked title={`Hola, ${session.user.name.split(" ")[0]}`} />;
		}
		return <PatientDashboard name={session.user.name} home={patientHome} />;
	}

	// Loaded on the server; `home.nowIso` keeps both sides on the same clock.
	const home = await loadTherapistHome.execute(session.user);

	return <TherapistDashboard name={session.user.name} home={home} />;
}
