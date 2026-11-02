"use client";

import { cn } from "@helsa/ui/lib/utils";
import { CalendarDays, Wallet } from "lucide-react";

import type { PatientProfile } from "@/lib/core/patient/use-cases/load-patient-profile";
import { paymentStatusLabels } from "../payments/format";
import {
	type DisplayState,
	formatClock,
	formatDuration,
	longDay,
	modalityIcons,
	modalityLabels,
	stateLabels,
	stateStyles,
} from "../schedule/format";
import { type PaymentMethod, paymentMethodLabels } from "../settings/schema";
import { Panel, PanelHeading } from "../therapist/parts";
import { EmptyState, formatDate, formatUsd } from "./parts";

type Appointment = PatientProfile["appointments"][number];

function stateOf(item: Appointment, now: number): DisplayState {
	if (item.status !== "scheduled" && item.status !== "confirmed")
		return item.status;
	if (now >= Date.parse(item.endsAt)) return "unclosed";
	if (now >= Date.parse(item.startsAt)) return "live";
	return item.status;
}

export function HistoryTab({ profile }: { profile: PatientProfile }) {
	const { appointments, payments, timeFormat, timezone } = profile;
	const now = Date.parse(profile.nowIso);
	const total = payments
		.filter((payment) => payment.status === "verified")
		.reduce((sum, payment) => sum + payment.amountUsd, 0);

	return (
		<div className="grid gap-4 xl:grid-cols-12">
			<Panel aria-labelledby="appointments-title" className="xl:col-span-7">
				<PanelHeading id="appointments-title" title="Citas">
					<p className="text-[15px] text-muted-foreground">
						{appointments.length === 0
							? "Ninguna"
							: `${appointments.length} en total`}
					</p>
				</PanelHeading>
				<div className="mt-4">
					{appointments.length === 0 ? (
						<EmptyState icon={CalendarDays} title="Sin citas registradas" />
					) : (
						<ul className="flex flex-col gap-1">
							{appointments.map((item) => {
								const state = stateOf(item, now);
								const Icon = modalityIcons[item.modality];
								return (
									<li
										key={item.id}
										className={cn(
											"grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-3 py-3 hover:bg-dash-ground sm:px-4",
											(state === "cancelled" || state === "no_show") &&
												"opacity-70",
										)}
									>
										<div className="min-w-0">
											<p className="truncate font-semibold text-[15px]">
												{longDay(item.day)} ·{" "}
												{formatClock(item.time, timeFormat)}
											</p>
											<p className="flex items-center gap-1.5 truncate text-[14px] text-muted-foreground">
												<Icon
													aria-hidden="true"
													className="size-3.5 shrink-0"
												/>
												{item.modality === "in_person" && item.location
													? item.location
													: modalityLabels[item.modality]}{" "}
												· {formatDuration(item.minutes)}
											</p>
										</div>
										<span
											className={cn(
												"inline-flex h-8 items-center rounded-full px-3 font-semibold text-[13px]",
												stateStyles[state],
											)}
										>
											{stateLabels[state]}
										</span>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			</Panel>

			<Panel
				aria-labelledby="payments-title"
				className="xl:col-span-5 xl:self-start"
			>
				<PanelHeading id="payments-title" title="Pagos">
					<p className="text-[15px] text-muted-foreground">
						{payments.length ? `${formatUsd(total)} verificados` : "Ninguno"}
					</p>
				</PanelHeading>
				<div className="mt-4">
					{payments.length === 0 ? (
						<EmptyState icon={Wallet} title="Sin pagos registrados" />
					) : (
						<ul className="flex flex-col gap-1">
							{payments.map((payment) => (
								<li
									key={payment.id}
									className="flex items-center justify-between gap-3 rounded-2xl px-3 py-3 hover:bg-dash-ground sm:px-4"
								>
									<div className="min-w-0">
										<p className="font-semibold text-[15px]">
											{paymentMethodLabels[payment.method as PaymentMethod] ??
												payment.method}
										</p>
										<p className="truncate text-[14px] text-muted-foreground">
											{formatDate(payment.paidAt, timezone)}
											{payment.reference ? ` · Ref. ${payment.reference}` : ""}
											{payment.status === "verified"
												? ""
												: ` · ${paymentStatusLabels[payment.status]}`}
										</p>
									</div>
									<p className="font-semibold text-[16px] tabular-nums">
										{formatUsd(payment.amountUsd)}
									</p>
								</li>
							))}
						</ul>
					)}
				</div>
			</Panel>
		</div>
	);
}
