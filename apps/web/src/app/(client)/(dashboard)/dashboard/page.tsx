import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { toDashboardRole } from "@/components/dashboard/navigation";
import { SectionPending } from "@/components/dashboard/section-pending";
import { TherapistDashboard } from "@/components/dashboard/therapist/therapist-dashboard";
import { auth } from "@/services";

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

	// Rendered on the server so both sides start from the same clock.
	return (
		<TherapistDashboard
			name={session.user.name}
			nowIso={new Date().toISOString()}
		/>
	);
}
