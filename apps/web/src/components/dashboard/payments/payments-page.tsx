"use client";

import { Plus } from "lucide-react";
import { m } from "motion/react";
import { useState } from "react";

import type { ChargeStatus } from "@/lib/core/payment/domain/billing";
import type { PatientBalance } from "@/lib/core/payment/use-cases/load-patient-balances";
import type {
	OverviewPayment,
	PaymentsOverview,
} from "@/lib/core/payment/use-cases/load-payments-overview";

import { ActionButton } from "../profile/parts";
import { itemIn, stagger } from "../therapist/parts";
import { BalanceSummary } from "./balance-summary";
import { CollectPanel, ReminderDialog } from "./collect";
import { presetLabels, rangeTitle, usd } from "./format";
import { MethodsPanel, StatusBreakdown, TrendChart } from "./insights";
import { Ledger } from "./ledger";
import { PeriodPicker } from "./period-picker";
import {
	RecordPaymentDialog,
	type RecordTarget,
} from "./record-payment-dialog";
import { ReviewDialog, ReviewQueue } from "./review";

function headline({ summary }: PaymentsOverview) {
	const parts: string[] = [];
	if (summary.inReviewCount > 0) {
		parts.push(
			summary.inReviewCount === 1
				? "Tienes 1 pago por verificar."
				: `Tienes ${summary.inReviewCount} pagos por verificar.`,
		);
	}
	if (summary.owedUsd > 0) parts.push(`Te deben ${usd(summary.owedUsd)}.`);
	if (parts.length === 0) parts.push("Estás al día con tus cobros.");
	return parts.join(" ");
}

export function PaymentsPage({ overview }: { overview: PaymentsOverview }) {
	const { period, today } = overview;
	const [record, setRecord] = useState<RecordTarget | null>(null);
	const [remind, setRemind] = useState<PatientBalance | null>(null);
	const [review, setReview] = useState<OverviewPayment | null>(null);
	const [chargeFilter, setChargeFilter] = useState<ChargeStatus | "all">("all");

	function filterSessions(status: ChargeStatus | "all") {
		setChargeFilter(status);
		if (status !== "all") {
			document
				.getElementById("ledger-title")
				?.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}

	return (
		<m.div
			initial="hidden"
			animate="show"
			variants={stagger(0.08)}
			className="mx-auto max-w-[96rem]"
		>
			<m.header variants={itemIn} className="flex flex-col gap-5 pt-2 pb-8">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div>
						<h1 className="font-display font-medium text-[clamp(2.25rem,4vw,3.5rem)] leading-[1] tracking-[-0.03em]">
							Cobros
						</h1>
						<p className="mt-3 text-[17px] leading-relaxed">
							{period.preset === "custom"
								? ""
								: `${presetLabels[period.preset]}: `}
							{rangeTitle(period.from, period.to, today)}. {headline(overview)}
						</p>
					</div>
					<ActionButton onClick={() => setRecord({})}>
						<Plus aria-hidden="true" className="size-4" />
						Registrar pago
					</ActionButton>
				</div>
				<PeriodPicker
					key={`${period.preset}:${period.from}:${period.to}`}
					period={period}
				/>
			</m.header>

			<div className="grid gap-4 xl:grid-cols-12">
				<BalanceSummary overview={overview} />
				{overview.reviewQueue.length > 0 ? (
					<ReviewQueue overview={overview} onReview={setReview} />
				) : null}
				<CollectPanel
					overview={overview}
					onRemind={setRemind}
					onRecord={setRecord}
				/>
				<StatusBreakdown
					statuses={overview.statuses}
					selected={chargeFilter}
					onSelect={filterSessions}
				/>
				<MethodsPanel overview={overview} />
				<TrendChart overview={overview} />
				<HowItWorks overview={overview} />
				<Ledger
					overview={overview}
					chargeFilter={chargeFilter}
					onChargeFilter={setChargeFilter}
					onRecord={setRecord}
					onReview={setReview}
				/>
				{overview.reviewQueue.length === 0 ? (
					<ReviewQueue overview={overview} onReview={setReview} />
				) : null}
			</div>

			<RecordPaymentDialog
				overview={overview}
				target={record}
				onClose={() => setRecord(null)}
			/>
			<ReminderDialog
				patient={remind}
				overview={overview}
				onClose={() => setRemind(null)}
			/>
			<ReviewDialog
				payment={review}
				today={today}
				onClose={() => setReview(null)}
			/>
		</m.div>
	);
}

/** What to set up so the numbers are complete. */
function HowItWorks({ overview }: { overview: PaymentsOverview }) {
	const { summary, therapist } = overview;
	const tips: Array<[string, string, string]> = [];
	if (!therapist.hasDefaultPrice || summary.unpriced > 0) {
		tips.push([
			"Precio de sesión",
			summary.unpriced > 0
				? `${summary.unpriced} ${summary.unpriced === 1 ? "sesión no tiene" : "sesiones no tienen"} precio, así que no se cuentan como deuda.`
				: "Define tu precio por defecto para calcular lo que te deben.",
			"/dashboard/settings#precios",
		]);
	}
	if (therapist.paymentMethods.length === 0 || !therapist.paymentInstructions) {
		tips.push([
			"Datos de pago",
			"Agrega tus métodos y los datos para pagarte: se incluyen en los recordatorios.",
			"/dashboard/settings#precios",
		]);
	}

	return (
		<m.aside
			variants={itemIn}
			aria-label="Consejos"
			className="flex flex-col gap-4 rounded-[1.75rem] bg-chapter-lilac p-5 sm:p-6 xl:col-span-4"
		>
			<h2 className="font-display font-medium text-[1.375rem] leading-tight">
				Cómo se calcula
			</h2>
			<ul className="flex flex-col gap-2 text-[14px] leading-relaxed">
				<li>
					<strong>Cobrado</strong> suma solo pagos verificados, por la fecha en
					que se hicieron.
				</li>
				<li>
					<strong>Facturado</strong> es el valor de las sesiones atendidas en el
					periodo.
				</li>
				<li>
					Los <strong>bolívares</strong> usan el monto real recibido; los pagos
					en divisas se convierten a la tasa de referencia.
				</li>
			</ul>
			{tips.map(([title, text, href]) => (
				<a
					key={title}
					href={href}
					className="rounded-2xl bg-card px-4 py-3 text-[14px] outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring"
				>
					<span className="block font-semibold">{title}</span>
					{text}
				</a>
			))}
		</m.aside>
	);
}
