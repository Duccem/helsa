import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { toDashboardRole } from "@/components/dashboard/navigation";
import { SectionPending } from "@/components/dashboard/section-pending";
import { TherapistDashboard } from "@/components/dashboard/therapist/therapist-dashboard";
import { LoadTherapistHome } from "@/lib/core/therapist/use-cases/load-therapist-home";
import { auth } from "@/services";

const loadTherapistHome = new LoadTherapistHome();

export default async function DashboardPage() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user) {
		redirect("/sign-in");
	}

	if (toDashboardRole(session.user.role) === "patient") {
		return (
			<SectionPending
				title={`Hola, ${session.user.name.split(" ")[0]}`}
				description="Aquí verás tus próximas citas, tus tareas y tus pagos. Estamos terminando esta parte."
			/>
		);
	}

	// Loaded on the server; `home.nowIso` keeps both sides on the same clock.
	const home = await loadTherapistHome.execute(session.user);

	return <TherapistDashboard name={session.user.name} home={home} />;
}
