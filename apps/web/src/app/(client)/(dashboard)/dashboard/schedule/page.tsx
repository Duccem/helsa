import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { toDashboardRole } from "@/components/dashboard/navigation";
import { SchedulePage } from "@/components/dashboard/schedule/schedule-page";
import { SectionPending } from "@/components/dashboard/section-pending";
import { LoadSchedule } from "@/lib/core/appointment/use-cases/load-schedule";
import { auth } from "@/services";

export const metadata: Metadata = { title: "Agenda" };

const loadSchedule = new LoadSchedule();

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
		return <SectionPending title="Mis citas" />;
	}

	const { month } = await searchParams;
	const schedule = await loadSchedule.execute(
		{ month: typeof month === "string" ? month : undefined },
		session.user,
	);

	// Keyed by month so the selected day resets when the therapist changes month.
	return <SchedulePage key={schedule.month} schedule={schedule} />;
}
