"use client";

import { cn } from "@helsa/ui/lib/utils";
import { m } from "motion/react";
import { toast } from "sonner";

import { type ClinicNow, monthNames } from "./clinic-time";
import {
	monthByMethod,
	type PaymentMethod,
	paymentMethodLabels,
	pendingPayments,
	recentPayments,
	sampleRate,
} from "./mock-data";
import {
	EASE_OUT,
	Panel,
	PanelHeading,
	PanelLink,
	PatientAvatar,
	usd,
	ves,
} from "./parts";

const methodFields: Record<PaymentMethod, string> = {
	pago_movil: "bg-chapter-violet dark:bg-primary",
	zelle: "bg-chapter-teal-deep",
	binance_usdt: "bg-chapter-peach-deep",
	efectivo_usd: "bg-chapter-lilac-deep",
};

export function PaymentsPanel({ now }: { now: ClinicNow }) {
	const total = monthByMethod.reduce((sum, entry) => sum + entry.usd, 0);
	const pending = pendingPayments.reduce((sum, entry) => sum + entry.usd, 0);
	const rate = new Intl.NumberFormat("es-VE", {
		minimumFractionDigits: 2,
	}).format(sampleRate.vesPerUsd);

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
						{usd(total)}
					</p>
					<p className="mt-2 text-[16px]">
						cobrados en {monthNames[now.month - 1]} ·{" "}
						{ves(total * sampleRate.vesPerUsd)}
					</p>
					<p className="mt-1 text-[14px] text-muted-foreground">
						Tasa {sampleRate.source} de ejemplo: Bs {rate} por dólar.
					</p>

					<div
						role="img"
						aria-label={`Por método: ${monthByMethod
							.map(
								(entry) =>
									`${paymentMethodLabels[entry.method]} ${usd(entry.usd)}`,
							)
							.join(", ")}`}
						className="mt-6 flex h-4 gap-1 overflow-hidden rounded-full"
					>
						{monthByMethod.map((entry, index) => (
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
						{monthByMethod.map((entry) => (
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
				</div>

				<div className="rounded-3xl bg-chapter-peach p-5 lg:col-span-3">
					<h3 className="font-semibold text-[16px]">
						Por cobrar · {usd(pending)}
					</h3>
					<ul className="mt-3 flex flex-col gap-4">
						{pendingPayments.map((entry) => (
							<li key={entry.id}>
								<div className="flex items-baseline justify-between gap-3">
									<p className="truncate font-semibold text-[15px]">
										{entry.patient}
									</p>
									<p className="font-semibold text-[15px] tabular-nums">
										{usd(entry.usd)}
									</p>
								</div>
								<p className="text-[14px] text-foreground/75">{entry.detail}</p>
								<button
									type="button"
									onClick={() =>
										toast.success(
											`Recordatorio de pago enviado a ${entry.patient}.`,
											{
												description:
													"Acción de ejemplo: aún no hay datos reales.",
											},
										)
									}
									className="mt-2 inline-flex h-9 items-center rounded-full bg-card px-4 font-semibold text-[14px] outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring active:translate-y-0 active:scale-[0.97]"
								>
									Recordar por WhatsApp
								</button>
							</li>
						))}
					</ul>
				</div>

				<div className="lg:col-span-4">
					<h3 className="px-1 font-semibold text-[16px]">Últimos pagos</h3>
					<ul className="mt-2 flex flex-col gap-1">
						{recentPayments.map((entry) => (
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
										{paymentMethodLabels[entry.method]} · {entry.when}
									</p>
								</div>
								<p className="font-semibold text-[15px] tabular-nums">
									{usd(entry.usd)}
								</p>
							</li>
						))}
					</ul>
				</div>
			</div>
		</Panel>
	);
}
