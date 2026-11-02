"use client";

import { cn } from "@helsa/ui/lib/utils";
import { ArrowDownRight, ArrowUpRight, Info } from "lucide-react";
import { m } from "motion/react";

import type { PaymentsOverview } from "@/lib/core/payment/use-cases/load-payments-overview";

import { EASE_OUT, itemIn, Panel, stagger } from "../therapist/parts";
import {
	delta,
	percent,
	rangeTitle,
	rate,
	sessionsLabel,
	usd,
	ves,
} from "./format";

function Delta({ current, previous }: { current: number; previous: number }) {
	const result = delta(current, previous);
	if (!result) return null;
	const up = result.change >= 0;
	const Icon = up ? ArrowUpRight : ArrowDownRight;
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold text-[13px]",
				up
					? "bg-chapter-teal text-foreground"
					: "bg-destructive/12 text-dash-alert",
			)}
		>
			<Icon aria-hidden="true" className="size-3.5" />
			{result.label}
		</span>
	);
}

/** Two figures for one amount, the preferred currency first. */
function Money({
	usdAmount,
	vesAmount,
	prefer,
	className,
}: {
	usdAmount: number;
	vesAmount: number | null;
	prefer: PaymentsOverview["currencyDisplay"];
	className?: string;
}) {
	const vesFirst = prefer === "ves" && vesAmount !== null;
	const main = vesFirst ? ves(vesAmount) : usd(usdAmount);
	const second = vesFirst
		? usd(usdAmount)
		: vesAmount === null
			? null
			: ves(vesAmount);
	return (
		<div className={className}>
			<p className="font-display font-medium text-[clamp(2.5rem,5vw,4rem)] tabular-nums leading-none tracking-[-0.03em]">
				{main}
			</p>
			{second && prefer !== "usd" ? (
				<p className="mt-2 font-semibold text-[17px] tabular-nums">{second}</p>
			) : second ? (
				<p className="mt-2 text-[16px] text-muted-foreground tabular-nums">
					{second}
				</p>
			) : null}
		</div>
	);
}

export function BalanceSummary({ overview }: { overview: PaymentsOverview }) {
	const {
		summary,
		rate: reference,
		currencyDisplay,
		period,
		previousPeriod,
		today,
	} = overview;
	const vesRate = reference?.vesPerUsd ?? null;
	const toVes = (amount: number) =>
		vesRate === null ? null : amount * vesRate;
	const split = summary.receivedVesAsUsd + summary.receivedForeignUsd;

	return (
		<>
			<Panel aria-labelledby="collected-title" className="xl:col-span-7">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h2 id="collected-title" className="font-semibold text-[16px]">
						Cobrado · {rangeTitle(period.from, period.to, today)}
					</h2>
					<p className="flex items-center gap-2 text-[14px] text-muted-foreground">
						<Delta
							current={summary.collectedUsd}
							previous={summary.previous.collectedUsd}
						/>
						<span>
							vs. {rangeTitle(previousPeriod.from, previousPeriod.to, today)} (
							{usd(summary.previous.collectedUsd)})
						</span>
					</p>
				</div>

				<Money
					className="mt-5"
					usdAmount={summary.collectedUsd}
					vesAmount={summary.collectedVes}
					prefer={currencyDisplay}
				/>
				<p className="mt-2 text-[14px] text-muted-foreground">
					{summary.paymentsCount === 1
						? "1 pago verificado"
						: `${summary.paymentsCount} pagos verificados`}
					{reference
						? ` · Tasa ${reference.source} ${rate(reference.vesPerUsd)} Bs/$ (${reference.date ?? "sin fecha"})`
						: ""}
				</p>
				{!reference ? (
					<p className="mt-3 flex items-start gap-2 rounded-2xl bg-dash-ground px-4 py-3 text-[14px]">
						<Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
						Aún no hay una tasa de referencia. Registra un pago en bolívares con
						su tasa para ver los totales en Bs.
					</p>
				) : null}

				<div className="mt-6">
					<div
						role="img"
						aria-label={`Recibido en bolívares ${usd(summary.receivedVesAsUsd)}, en divisas ${usd(summary.receivedForeignUsd)}`}
						className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-dash-ground"
					>
						{split > 0
							? [
									[
										"bg-chapter-violet dark:bg-primary",
										summary.receivedVesAsUsd,
									],
									["bg-chapter-teal-deep", summary.receivedForeignUsd],
								].map(([fill, value], index) =>
									Number(value) > 0 ? (
										<m.span
											key={String(fill)}
											initial={{ scaleX: 0 }}
											animate={{ scaleX: 1 }}
											transition={{
												duration: 0.7,
												ease: EASE_OUT,
												delay: 0.2 + index * 0.08,
											}}
											style={{
												flexGrow: Number(value),
												transformOrigin: "0% 50%",
											}}
											className={cn("h-full rounded-full", fill)}
										/>
									) : null,
								)
							: null}
					</div>
					<dl className="mt-3 grid gap-3 text-[15px] sm:grid-cols-2">
						<div className="flex items-start gap-2">
							<span
								aria-hidden="true"
								className="mt-1.5 size-2.5 shrink-0 rounded-full bg-chapter-violet dark:bg-primary"
							/>
							<div>
								<dt className="text-muted-foreground">Recibido en bolívares</dt>
								<dd className="font-semibold tabular-nums">
									{ves(summary.receivedVes)}{" "}
									<span className="font-normal text-muted-foreground">
										≈ {usd(summary.receivedVesAsUsd)}
									</span>
								</dd>
							</div>
						</div>
						<div className="flex items-start gap-2">
							<span
								aria-hidden="true"
								className="mt-1.5 size-2.5 shrink-0 rounded-full bg-chapter-teal-deep"
							/>
							<div>
								<dt className="text-muted-foreground">Recibido en divisas</dt>
								<dd className="font-semibold tabular-nums">
									{usd(summary.receivedForeignUsd)}
								</dd>
							</div>
						</div>
					</dl>
				</div>
			</Panel>

			<Panel
				aria-labelledby="owed-title"
				className="bg-chapter-peach xl:col-span-5"
			>
				<h2 id="owed-title" className="font-semibold text-[16px]">
					Por cobrar hoy
				</h2>
				<Money
					className="mt-5"
					usdAmount={summary.owedUsd}
					vesAmount={toVes(summary.owedUsd)}
					prefer={currencyDisplay}
				/>
				<p className="mt-2 text-[14px] text-foreground/75">
					Sesiones ya atendidas sin pagar, de cualquier fecha, menos los saldos
					a favor.
				</p>
				<dl className="mt-5 grid grid-cols-2 gap-3">
					{[
						["Vencido", summary.overdueUsd, "más de 7 días"],
						[
							"Por verificar",
							summary.inReviewUsd,
							summary.inReviewCount === 1
								? "1 comprobante"
								: `${summary.inReviewCount} comprobantes`,
						],
					].map(([label, value, hint]) => (
						<div
							key={String(label)}
							className="rounded-2xl bg-card/70 px-4 py-3"
						>
							<dt className="text-[14px] text-foreground/75">{label}</dt>
							<dd className="font-semibold text-[20px] tabular-nums">
								{usd(Number(value))}
							</dd>
							<dd className="text-[13px] text-foreground/70">{hint}</dd>
						</div>
					))}
				</dl>
			</Panel>

			<m.ul
				variants={stagger(0.05)}
				aria-label="Indicadores del periodo"
				className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:col-span-12 xl:grid-cols-6"
			>
				{[
					{
						label: "Facturado",
						value: usd(summary.billedUsd),
						note: `${sessionsLabel(summary.attended)} atendidas`,
						extra: (
							<Delta
								current={summary.billedUsd}
								previous={summary.previous.billedUsd}
							/>
						),
					},
					{
						label: "Tasa de cobro",
						value:
							summary.collectionRate === null
								? "—"
								: percent(summary.collectionRate),
						note: "de lo facturado ya está pagado",
					},
					{
						label: "Ingreso esperado",
						value: usd(summary.expectedUsd),
						note: "sesiones por venir en el periodo",
					},
					{
						label: "Valor por sesión",
						value:
							summary.averageSessionUsd === null
								? "—"
								: usd(summary.averageSessionUsd),
						note: "promedio de las atendidas",
					},
					{
						label: "Días para cobrar",
						value:
							summary.averageDaysToPay === null
								? "—"
								: String(summary.averageDaysToPay).replace(".", ","),
						note: "promedio entre sesión y pago",
					},
					{
						label: "Inasistencias",
						value: String(summary.noShows),
						note:
							summary.unpriced > 0
								? `${sessionsLabel(summary.unpriced)} sin precio`
								: "en el periodo",
					},
				].map((tile) => (
					<m.li
						key={tile.label}
						variants={itemIn}
						className="min-w-0 rounded-[1.5rem] bg-card p-5"
					>
						<p className="flex items-center justify-between gap-2 text-[14px] text-muted-foreground">
							{tile.label}
							{tile.extra}
						</p>
						<p className="mt-2 font-display font-medium text-[1.75rem] tabular-nums leading-none tracking-[-0.02em]">
							{tile.value}
						</p>
						<p className="mt-2 text-[13px] text-muted-foreground leading-snug">
							{tile.note}
						</p>
					</m.li>
				))}
			</m.ul>
		</>
	);
}
