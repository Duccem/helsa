import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { toDashboardRole } from "@/components/dashboard/navigation";
import {
	loadPortal,
	NotLinked,
} from "@/components/dashboard/patient/not-linked";
import { PatientPaymentsPage } from "@/components/dashboard/patient/payments-page";
import { PaymentsPage } from "@/components/dashboard/payments/payments-page";
import { LoadPatientPayments } from "@/lib/core/payment/use-cases/load-patient-payments";
import { LoadPaymentsOverview } from "@/lib/core/payment/use-cases/load-payments-overview";
import { auth } from "@/services";

export const metadata: Metadata = { title: "Cobros" };

const loadPaymentsOverview = new LoadPaymentsOverview();
const loadPatientPayments = new LoadPatientPayments();

type Param = string | string[] | undefined;

const single = (value: Param) =>
	typeof value === "string" ? value : undefined;

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<
		Partial<Record<"preset" | "from" | "to" | "remind" | "record", Param>>
	>;
}) {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user) {
		redirect("/sign-in");
	}

	if (toDashboardRole(session.user.role) === "patient") {
		const user = session.user;
		const data = await loadPortal(() => loadPatientPayments.execute(user));
		if (!data) return <NotLinked title="Pagos" />;
		return <PatientPaymentsPage data={data} />;
	}

	const params = await searchParams;
	const overview = await loadPaymentsOverview.execute(
		{
			preset: single(params.preset),
			from: single(params.from),
			to: single(params.to),
		},
		session.user,
	);

	// Links from the home screen open a dialog right away.
	const remind = single(params.remind);
	return (
		<PaymentsPage
			overview={overview}
			initialRemind={
				overview.balances.patients.some((item) => item.id === remind)
					? remind
					: undefined
			}
			initialRecord={single(params.record) === "1"}
		/>
	);
}
