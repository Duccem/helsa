import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { toDashboardRole } from "@/components/dashboard/navigation";
import { PatientAppointmentsPage } from "@/components/dashboard/patient/appointments-page";
import {
	loadPortal,
	NotLinked,
} from "@/components/dashboard/patient/not-linked";
import { SchedulePage } from "@/components/dashboard/schedule/schedule-page";
import { LoadPatientAppointments } from "@/lib/core/appointment/use-cases/load-patient-appointments";
import { LoadSchedule } from "@/lib/core/appointment/use-cases/load-schedule";
import { auth } from "@/services";

export const metadata: Metadata = { title: "Agenda" };

const loadSchedule = new LoadSchedule();
const loadPatientAppointments = new LoadPatientAppointments();

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ month?: string | string[] }>;
}) {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user) {
		redirect("/sign-in");
	}

	if (toDashboardRole(session.user.role) === "patient") {
		const user = session.user;
		const data = await loadPortal(() => loadPatientAppointments.execute(user));
		if (!data) return <NotLinked title="Mis citas" />;
		return <PatientAppointmentsPage data={data} />;
	}

	const { month } = await searchParams;
	const schedule = await loadSchedule.execute(
		{ month: typeof month === "string" ? month : undefined },
		session.user,
	);

	// Keyed by month so the selected day resets when the therapist changes month.
	return <SchedulePage key={schedule.month} schedule={schedule} />;
}
