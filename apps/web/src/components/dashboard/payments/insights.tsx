"use client";

import { cn } from "@helsa/ui/lib/utils";
import { m } from "motion/react";
import { useState } from "react";

import type { ChargeStatus } from "@/lib/core/payment/domain/billing";
import type { PaymentsOverview } from "@/lib/core/payment/use-cases/load-payments-overview";

import { paymentMethodLabels } from "../settings/schema";
import {
	EASE_OUT,
	Panel,
	PanelHeading,
	PatientAvatar,
} from "../therapist/parts";
import {
	chargeFills,
	chargeHints,
	chargeLabels,
	percent,
	sessionsLabel,
	shortDay,
	usd,
	ves,
} from "./format";

// ─── Sessions by payment status ──────────────────────────────────────────────

export function StatusBreakdown({
	statuses,
	selected,
	onSelect,
}: {
	statuses: PaymentsOverview["statuses"];
	selected: ChargeStatus | "all";
	onSelect: (status: ChargeStatus | "all") => void;
}) {
	const shown = statuses.filter((item) => item.count > 0);
	const total = shown.reduce((sum, item) => sum + item.amountUsd, 0);
	const sessions = shown.reduce((sum, item) => sum + item.count, 0);

	return (
		<Panel aria-labelledby="status-title" className="xl:col-span-8">
			<PanelHeading id="status-title" title="Sesiones por estado de pago">
				<p className="text-[15px] text-muted-foreground">
					{sessionsLabel(sessions)} en el periodo
				</p>
			</PanelHeading>

			{shown.length === 0 ? (
				<p className="mt-4 rounded-2xl bg-dash-ground px-5 py-8 text-[16px]">
					No hay sesiones en este periodo.
				</p>
			) : (
				<>
					<div
						role="img"
						aria-label={shown
							.map(
								(item) => `${chargeLabels[item.status]} ${usd(item.amountUsd)}`,
							)
							.join(", ")}
						className="mt-5 flex h-4 gap-0.5 overflow-hidden rounded-full bg-dash-ground"
					>
						{total > 0
							? shown
									.filter((item) => item.amountUsd > 0)
									.map((item, index) => (
										<m.span
											key={item.status}
											initial={{ scaleX: 0 }}
											animate={{ scaleX: 1 }}
											transition={{
												duration: 0.7,
												ease: EASE_OUT,
												delay: 0.2 + index * 0.06,
											}}
											style={{
												flexGrow: item.amountUsd,
												transformOrigin: "0% 50%",
											}}
											className={cn(
												"h-full rounded-full",
												chargeFills[item.status],
											)}
										/>
									))
							: null}
					</div>

					<ul className="mt-4 grid gap-1 sm:grid-cols-2">
						{shown.map((item) => {
							const on = selected === item.status;
							return (
								<li key={item.status}>
									<button
										type="button"
										aria-pressed={on}
										onClick={() => onSelect(on ? "all" : item.status)}
										className={cn(
											"flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
											on ? "bg-chapter-lilac" : "hover:bg-dash-ground",
										)}
									>
										<span
											aria-hidden="true"
											className={cn(
												"size-3 shrink-0 rounded-full",
												chargeFills[item.status],
											)}
										/>
										<span className="min-w-0 flex-1">
											<span className="block font-semibold text-[15px]">
												{chargeLabels[item.status]}{" "}
												<span className="font-normal text-muted-foreground tabular-nums">
													· {item.count}
												</span>
											</span>
											<span className="block truncate text-[13px] text-muted-foreground">
												{chargeHints[item.status]}
											</span>
										</span>
										<span className="font-semibold text-[15px] tabular-nums">
											{item.status === "unpriced" ? "—" : usd(item.amountUsd)}
										</span>
									</button>
								</li>
							);
						})}
					</ul>
				</>
			)}
		</Panel>
	);
}

// ─── Collected over time ─────────────────────────────────────────────────────

const granularityLabels = {
	day: "por día",
	week: "por semana",
	month: "por mes",
} as const;

function bucketLabel(
	key: string,
	granularity: PaymentsOverview["period"]["granularity"],
	today: string,
) {
	if (granularity === "month")
		return shortDay(key, today).split(" ").slice(1).join(" ");
	return granularity === "week"
		? `Semana del ${shortDay(key, today)}`
		: shortDay(key, today);
}

export function TrendChart({ overview }: { overview: PaymentsOverview }) {
	const { trend, period, today } = overview;
	const [active, setActive] = useState<string | null>(null);
	const max = Math.max(...trend.map((item) => item.usd), 0);
	const focus = trend.find((item) => item.key === active);
	const total = trend.reduce((sum, item) => sum + item.usd, 0);

	return (
		<Panel aria-labelledby="trend-title" className="xl:col-span-8">
			<PanelHeading id="trend-title" title="Cobrado en el tiempo">
				<p
					className="text-[15px] text-muted-foreground tabular-nums"
					aria-live="polite"
				>
					{focus
						? `${bucketLabel(focus.key, period.granularity, today)} · ${usd(focus.usd)}`
						: `${usd(total)} ${granularityLabels[period.granularity]}`}
				</p>
			</PanelHeading>

			{max === 0 ? (
				<p className="mt-4 rounded-2xl bg-dash-ground px-5 py-8 text-[16px]">
					Aún no hay pagos verificados en este periodo.
				</p>
			) : (
				<div className="mt-5">
					<div className="relative h-48">
						<div
							aria-hidden="true"
							className="absolute inset-x-0 top-0 border-foreground/10 border-t border-dashed"
						/>
						<span
							aria-hidden="true"
							className="absolute top-1 left-0 text-[12px] text-muted-foreground tabular-nums"
						>
							{usd(max)}
						</span>
						<ul
							className="absolute inset-0 flex items-end gap-[2px] pt-6"
							aria-label="Cobrado por periodo"
						>
							{trend.map((item, index) => {
								const height =
									max > 0
										? Math.max(item.usd > 0 ? 3 : 0, (item.usd / max) * 100)
										: 0;
								const on = item.key === active;
								return (
									<li
										key={item.key}
										className="flex h-full min-w-0 flex-1 items-end"
									>
										<button
											type="button"
											aria-label={`${bucketLabel(item.key, period.granularity, today)}: ${usd(item.usd)}, ${item.count} pagos`}
											onMouseEnter={() => setActive(item.key)}
											onMouseLeave={() => setActive(null)}
											onFocus={() => setActive(item.key)}
											onBlur={() => setActive(null)}
											className="group flex h-full w-full items-end rounded-t-[4px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
										>
											<m.span
												initial={{ scaleY: 0 }}
												animate={{ scaleY: 1 }}
												transition={{
													duration: 0.6,
													ease: EASE_OUT,
													delay: 0.1 + index * 0.01,
												}}
												style={{
													height: `${height}%`,
													transformOrigin: "50% 100%",
												}}
												className={cn(
													"block w-full rounded-t-[4px] transition-colors",
													on
														? "bg-chapter-violet dark:bg-primary"
														: "bg-chapter-lilac-deep",
												)}
											/>
										</button>
									</li>
								);
							})}
						</ul>
					</div>
					<div
						aria-hidden="true"
						className="mt-2 flex justify-between text-[12px] text-muted-foreground"
					>
						<span>
							{bucketLabel(
								trend[0]?.key ?? period.from,
								period.granularity,
								today,
							)}
						</span>
						<span>
							{bucketLabel(
								trend.at(-1)?.key ?? period.to,
								period.granularity,
								today,
							)}
						</span>
					</div>
				</div>
			)}
		</Panel>
	);
}

// ─── Methods and patients ────────────────────────────────────────────────────

export function MethodsPanel({ overview }: { overview: PaymentsOverview }) {
	const { methods, topPatients, summary } = overview;
	const total = summary.collectedUsd;

	return (
		<Panel aria-labelledby="methods-title" className="xl:col-span-4">
			<PanelHeading id="methods-title" title="Por método" />
			{methods.length === 0 ? (
				<p className="mt-4 text-[15px] text-muted-foreground">
					Sin pagos verificados.
				</p>
			) : (
				<ul className="mt-4 flex flex-col gap-3">
					{methods.map((item) => (
						<li key={item.method}>
							<div className="flex items-baseline justify-between gap-3 text-[15px]">
								<span className="truncate font-medium">
									{paymentMethodLabels[item.method]}
								</span>
								<span className="font-semibold tabular-nums">
									{usd(item.usd)}
								</span>
							</div>
							<div className="mt-1.5 h-2 overflow-hidden rounded-full bg-dash-ground">
								<m.div
									initial={{ scaleX: 0 }}
									animate={{ scaleX: 1 }}
									transition={{ duration: 0.6, ease: EASE_OUT }}
									style={{
										width: `${total > 0 ? (item.usd / total) * 100 : 0}%`,
										transformOrigin: "0% 50%",
									}}
									className="h-full rounded-full bg-chapter-teal-deep"
								/>
							</div>
							<p className="mt-1 text-[13px] text-muted-foreground tabular-nums">
								{total > 0 ? percent(item.usd / total) : "—"} · {item.count}{" "}
								{item.count === 1 ? "pago" : "pagos"}
								{item.ves > 0 ? ` · ${ves(item.ves)}` : ""}
							</p>
						</li>
					))}
				</ul>
			)}

			<h3 className="mt-7 font-semibold text-[16px]">
				Pacientes que más aportan
			</h3>
			{topPatients.length === 0 ? (
				<p className="mt-2 text-[15px] text-muted-foreground">
					Sin datos en el periodo.
				</p>
			) : (
				<ul className="mt-2 flex flex-col gap-1">
					{topPatients.map((item) => (
						<li
							key={item.id}
							className="flex items-center gap-3 rounded-2xl px-1 py-1.5"
						>
							<PatientAvatar name={item.name} className="size-8 text-[12px]" />
							<span className="min-w-0 flex-1 truncate text-[15px]">
								{item.name}
							</span>
							<span className="text-[13px] text-muted-foreground tabular-nums">
								{percent(item.share)}
							</span>
							<span className="font-semibold text-[15px] tabular-nums">
								{usd(item.usd)}
							</span>
						</li>
					))}
				</ul>
			)}
		</Panel>
	);
}
