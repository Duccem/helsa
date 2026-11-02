"use client";

import { cn } from "@helsa/ui/lib/utils";
import { m } from "motion/react";
import Link from "next/link";

import type { PaymentMethod } from "@/lib/core/payment/domain/types";
import type { TherapistHome } from "@/lib/core/therapist/use-cases/load-therapist-home";

import { paymentMethodLabels } from "../settings/schema";
import { monthNames } from "./clinic-time";
import {
	EASE_OUT,
	Panel,
	PanelHeading,
	PanelLink,
	PatientAvatar,
	usd,
	ves,
} from "./parts";

// Fixed per method, so a method keeps its color whatever else was paid.
const methodFields: Record<PaymentMethod, string> = {
	pago_movil: "bg-chapter-violet dark:bg-primary",
	zelle: "bg-chapter-teal-deep",
	binance_usdt: "bg-chapter-peach-deep",
	efectivo_usd: "bg-chapter-lilac-deep",
	transferencia_bs: "bg-chapter-violet/55 dark:bg-primary/55",
	efectivo_bs: "bg-chapter-teal",
	tarjeta: "bg-chapter-peach",
	otro: "bg-foreground/25",
};

function when(iso: string, timeZone: string, today: string) {
	const day = new Intl.DateTimeFormat("en-CA", { timeZone }).format(
		new Date(iso),
	);
	const time = new Intl.DateTimeFormat("es", {
		timeZone,
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(iso));
	if (day === today) return `Hoy, ${time}`;
	return new Intl.DateTimeFormat("es", {
		timeZone,
		weekday: "long",
		day: "numeric",
	})
		.format(new Date(iso))
		.replace(/^./, (letter) => letter.toUpperCase());
}

function age(days: number) {
	if (days === 0) return "de hoy";
	return days === 1 ? "desde ayer" : `desde hace ${days} días`;
}

export function PaymentsPanel({
	payments,
	today,
	timezone,
}: {
	payments: TherapistHome["payments"];
	today: string;
	timezone: string;
}) {
	const { byMethod, collectedUsd, collectedVes, rate, pending, recent } =
		payments;
	const pendingTotal = pending.reduce((sum, entry) => sum + entry.usd, 0);
	const month = monthNames[Number(today.slice(5, 7)) - 1];

	return (
		<Panel aria-labelledby="payments-title" className="xl:col-span-12">
			<PanelHeading id="payments-title" title="Cobros">
				<PanelLink href="/dashboard/payments" className="-mr-3">
					Ver todos los cobros
				</PanelLink>
			</PanelHeading>

			<div className="mt-5 grid gap-8 lg:grid-cols-12 lg:gap-6">
				<div className="lg:col-span-5">
					<p className="font-display font-medium text-[clamp(2.75rem,5vw,4rem)] tabular-nums leading-none tracking-[-0.03em]">
						{usd(collectedUsd)}
					</p>
					<p className="mt-2 text-[16px]">
						cobrados en {month}
						{rate || collectedVes > 0 ? ` · ${ves(collectedVes)}` : ""}
					</p>
					<p className="mt-1 text-[14px] text-muted-foreground">
						{rate
							? `Tasa ${rate.source}: Bs ${new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2 }).format(rate.vesPerUsd)} por dólar.`
							: "Sin tasa de referencia todavía."}
						{payments.reviewCount > 0
							? ` ${payments.reviewCount === 1 ? "1 pago" : `${payments.reviewCount} pagos`} por verificar.`
							: ""}
					</p>

					{byMethod.length === 0 ? (
						<p className="mt-6 rounded-2xl bg-dash-ground px-5 py-6 text-[15px]">
							Aún no hay pagos verificados este mes.
						</p>
					) : (
						<>
							<div
								role="img"
								aria-label={`Por método: ${byMethod
									.map(
										(entry) =>
											`${paymentMethodLabels[entry.method]} ${usd(entry.usd)}`,
									)
									.join(", ")}`}
								className="mt-6 flex h-4 gap-1 overflow-hidden rounded-full"
							>
								{byMethod.map((entry, index) => (
									<m.span
										key={entry.method}
										variants={{
											hidden: { scaleX: 0 },
											show: {
												scaleX: 1,
												transition: {
													duration: 0.7,
													ease: EASE_OUT,
													delay: 0.3 + index * 0.08,
												},
											},
										}}
										style={{ flexGrow: entry.usd, transformOrigin: "0% 50%" }}
										className={cn(
											"h-full rounded-full",
											methodFields[entry.method],
										)}
									/>
								))}
							</div>
							<ul className="mt-4 grid gap-x-6 gap-y-2 text-[15px] sm:grid-cols-2">
								{byMethod.map((entry) => (
									<li key={entry.method} className="flex items-center gap-2">
										<span
											aria-hidden="true"
											className={cn(
												"size-2.5 shrink-0 rounded-full",
												methodFields[entry.method],
											)}
										/>
										<span className="truncate">
											{paymentMethodLabels[entry.method]}
										</span>
										<span className="ml-auto font-semibold tabular-nums">
											{usd(entry.usd)}
										</span>
									</li>
								))}
							</ul>
						</>
					)}
				</div>

				<div className="rounded-3xl bg-chapter-peach p-5 lg:col-span-3">
					<h3 className="font-semibold text-[16px]">
						Por cobrar · {usd(pendingTotal)}
					</h3>
					{pending.length === 0 ? (
						<p className="mt-3 text-[15px]">Nadie te debe. ¡Al día!</p>
					) : (
						<ul className="mt-3 flex flex-col gap-4">
							{pending.map((entry) => (
								<li key={entry.patientId}>
									<div className="flex items-baseline justify-between gap-3">
										<p className="truncate font-semibold text-[15px]">
											{entry.patient}
										</p>
										<p className="font-semibold text-[15px] tabular-nums">
											{usd(entry.usd)}
										</p>
									</div>
									<p className="text-[14px] text-foreground/75">
										{entry.sessions === 1
											? "1 sesión"
											: `${entry.sessions} sesiones`}{" "}
										{age(entry.oldestDaysAgo)}
									</p>
									{entry.canRemind ? (
										<Link
											href={`/dashboard/payments?remind=${entry.patientId}`}
											className="mt-2 inline-flex h-9 items-center rounded-full bg-card px-4 font-semibold text-[14px] outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring active:translate-y-0 active:scale-[0.97]"
										>
											Enviar recordatorio
										</Link>
									) : (
										<p className="mt-1 text-[13px] text-foreground/70">
											Sin teléfono ni correo registrado.
										</p>
									)}
								</li>
							))}
						</ul>
					)}
				</div>

				<div className="lg:col-span-4">
					<h3 className="px-1 font-semibold text-[16px]">Últimos pagos</h3>
					{recent.length === 0 ? (
						<p className="mt-2 px-1 text-[15px] text-muted-foreground">
							Sin pagos este mes.
						</p>
					) : (
						<ul className="mt-2 flex flex-col gap-1">
							{recent.map((entry) => (
								<li
									key={entry.id}
									className="flex items-center gap-3 rounded-2xl px-1 py-2 transition-colors hover:bg-dash-ground sm:px-2"
								>
									<PatientAvatar
										name={entry.patient}
										className="size-9 text-[13px]"
									/>
									<div className="min-w-0 flex-1">
										<p className="truncate font-semibold text-[15px]">
											{entry.patient}
										</p>
										<p className="truncate text-[14px] text-muted-foreground">
											{paymentMethodLabels[entry.method]} ·{" "}
											{when(entry.paidAt, timezone, today)}
										</p>
									</div>
									<p className="font-semibold text-[15px] tabular-nums">
										{usd(entry.usd)}
									</p>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</Panel>
	);
}
