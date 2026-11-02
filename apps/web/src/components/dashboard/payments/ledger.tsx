"use client";

import { cn } from "@helsa/ui/lib/utils";
import { CalendarX2, Paperclip, Receipt, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useDeletePayment } from "@/lib/api/mutations";
import type { ChargeStatus } from "@/lib/core/payment/domain/billing";
import type { PaymentStatus } from "@/lib/core/payment/domain/types";
import type {
	OverviewPayment,
	PaymentsOverview,
} from "@/lib/core/payment/use-cases/load-payments-overview";

import {
	ConfirmButton,
	EmptyState,
	useRefreshingAction,
} from "../patients/parts";
import { ActionButton } from "../profile/parts";
import { Segmented } from "../settings/fields";
import { paymentMethodLabels } from "../settings/schema";
import { Panel } from "../therapist/parts";
import {
	chargeBadge,
	chargeBadgeStyles,
	chargeLabels,
	paymentStatusLabels,
	paymentStatusStyles,
	shortDay,
	usd,
	ves,
} from "./format";
import type { RecordTarget } from "./record-payment-dialog";

type Tab = "sessions" | "payments";

function Badge({
	className,
	children,
}: {
	className: string;
	children: React.ReactNode;
}) {
	return (
		<span
			className={cn(
				"inline-flex h-6 shrink-0 items-center rounded-full px-2.5 font-semibold text-[12px]",
				className,
			)}
		>
			{children}
		</span>
	);
}

function FilterPills<V extends string>({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: ReadonlyArray<readonly [V, string, number]>;
	value: V;
	onChange: (value: V) => void;
}) {
	return (
		<fieldset
			aria-label={label}
			className="m-0 flex min-w-0 flex-wrap gap-1 border-0 p-0"
		>
			{options.map(([option, text, count]) => {
				const on = option === value;
				return (
					<button
						key={option}
						type="button"
						aria-pressed={on}
						onClick={() => onChange(option)}
						className={cn(
							"inline-flex h-8 items-center gap-1.5 rounded-full px-3 font-semibold text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
							on
								? "bg-chapter-lilac text-foreground"
								: "bg-dash-ground text-muted-foreground hover:text-foreground",
						)}
					>
						{text}
						<span className="tabular-nums opacity-70">{count}</span>
					</button>
				);
			})}
		</fieldset>
	);
}

export function Ledger({
	overview,
	chargeFilter,
	onChargeFilter,
	onRecord,
	onReview,
}: {
	overview: PaymentsOverview;
	chargeFilter: ChargeStatus | "all";
	onChargeFilter: (status: ChargeStatus | "all") => void;
	onRecord: (target: RecordTarget) => void;
	onReview: (payment: OverviewPayment) => void;
}) {
	const [tab, setTab] = useState<Tab>("sessions");
	const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">(
		"all",
	);
	const { sessions, payments, today } = overview;
	const remove = useDeletePayment();
	const run = useRefreshingAction();

	const visibleSessions =
		chargeFilter === "all"
			? sessions
			: sessions.filter((item) => item.charge === chargeFilter);
	const visiblePayments =
		paymentFilter === "all"
			? payments
			: payments.filter((item) => item.status === paymentFilter);

	const chargeOptions = [
		["all", "Todas", sessions.length] as const,
		...overview.statuses
			.filter((item) => item.count > 0)
			.map(
				(item) => [item.status, chargeLabels[item.status], item.count] as const,
			),
	];
	const paymentOptions = [
		["all", "Todos", payments.length] as const,
		...(["verified", "pending_review", "rejected"] as const)
			.map(
				(status) =>
					[
						status,
						paymentStatusLabels[status],
						payments.filter((item) => item.status === status).length,
					] as const,
			)
			.filter(([, , count]) => count > 0),
	];

	return (
		<Panel aria-labelledby="ledger-title" className="xl:col-span-12">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h2
					id="ledger-title"
					className="font-display font-medium text-[1.375rem] leading-tight tracking-[-0.01em]"
				>
					Detalle del periodo
				</h2>
				<Segmented
					label="Ver"
					options={[
						["sessions", "Sesiones"],
						["payments", "Pagos recibidos"],
					]}
					value={tab}
					onChange={setTab}
				/>
			</div>

			{tab === "sessions" ? (
				<>
					<div className="mt-4">
						<FilterPills
							label="Filtrar sesiones"
							options={chargeOptions}
							value={chargeFilter}
							onChange={onChargeFilter}
						/>
					</div>
					{visibleSessions.length === 0 ? (
						<div className="mt-4">
							<EmptyState
								icon={CalendarX2}
								title="No hay sesiones con este estado"
							/>
						</div>
					) : (
						<div className="mt-4 overflow-x-auto">
							<table className="w-full min-w-[44rem] border-separate border-spacing-y-1 text-left text-[15px]">
								<thead className="text-[13px] text-muted-foreground">
									<tr>
										<th className="px-3 py-2 font-medium">Sesión</th>
										<th className="px-3 py-2 font-medium">Paciente</th>
										<th className="px-3 py-2 font-medium">Estado</th>
										<th className="px-3 py-2 text-right font-medium">Precio</th>
										<th className="px-3 py-2 text-right font-medium">Pagado</th>
										<th className="px-3 py-2 text-right font-medium">Falta</th>
										<th className="px-3 py-2">
											<span className="sr-only">Acciones</span>
										</th>
									</tr>
								</thead>
								<tbody>
									{visibleSessions.map((item) => (
										<tr
											key={item.id}
											className="[&>td:first-child]:rounded-l-2xl [&>td:last-child]:rounded-r-2xl [&>td]:bg-dash-ground/60"
										>
											<td className="whitespace-nowrap px-3 py-2.5">
												{shortDay(item.day, today)}{" "}
												<span className="text-muted-foreground">
													· {item.time}
												</span>
											</td>
											<td className="max-w-[14rem] truncate px-3 py-2.5">
												<Link
													href={`/dashboard/patients/${item.patientId}`}
													className="font-medium hover:underline"
												>
													{item.patientName}
												</Link>
											</td>
											<td className="px-3 py-2.5">
												<Badge className={chargeBadgeStyles[item.charge]}>
													{chargeBadge[item.charge]}
												</Badge>
											</td>
											<td className="px-3 py-2.5 text-right tabular-nums">
												{item.priceUsd === null ? "—" : usd(item.priceUsd)}
											</td>
											<td className="px-3 py-2.5 text-right tabular-nums">
												{usd(item.paidUsd)}
												{item.reviewUsd > 0 ? (
													<span className="block text-[12px] text-muted-foreground">
														+{usd(item.reviewUsd)} por verificar
													</span>
												) : null}
											</td>
											<td className="px-3 py-2.5 text-right font-semibold tabular-nums">
												{item.dueUsd > 0 ? usd(item.dueUsd) : "—"}
											</td>
											<td className="px-3 py-2 text-right">
												{item.dueUsd > 0 ? (
													<ActionButton
														size="small"
														variant="quiet"
														className="h-8 px-3 text-[13px]"
														onClick={() =>
															onRecord({
																patientId: item.patientId,
																sessionIds: [item.id],
															})
														}
													>
														Registrar pago
													</ActionButton>
												) : null}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</>
			) : (
				<>
					<div className="mt-4">
						<FilterPills
							label="Filtrar pagos"
							options={paymentOptions}
							value={paymentFilter}
							onChange={setPaymentFilter}
						/>
					</div>
					{visiblePayments.length === 0 ? (
						<div className="mt-4">
							<EmptyState icon={Receipt} title="No hay pagos en este periodo">
								Registra un pago desde el botón de arriba o desde una sesión
								pendiente.
							</EmptyState>
						</div>
					) : (
						<div className="mt-4 overflow-x-auto">
							<table className="w-full min-w-[46rem] border-separate border-spacing-y-1 text-left text-[15px]">
								<thead className="text-[13px] text-muted-foreground">
									<tr>
										<th className="px-3 py-2 font-medium">Fecha</th>
										<th className="px-3 py-2 font-medium">Paciente</th>
										<th className="px-3 py-2 font-medium">Método</th>
										<th className="px-3 py-2 text-right font-medium">Monto</th>
										<th className="px-3 py-2 font-medium">Estado</th>
										<th className="px-3 py-2">
											<span className="sr-only">Acciones</span>
										</th>
									</tr>
								</thead>
								<tbody>
									{visiblePayments.map((item) => (
										<tr
											key={item.id}
											className="[&>td:first-child]:rounded-l-2xl [&>td:last-child]:rounded-r-2xl [&>td]:bg-dash-ground/60"
										>
											<td className="whitespace-nowrap px-3 py-2.5">
												{shortDay(item.day, today)}
												<span className="block text-[12px] text-muted-foreground">
													{item.sessionDay
														? `Sesión ${shortDay(item.sessionDay, today)}${item.sessionCancelled ? " (cancelada)" : ""}`
														: "Saldo a favor"}
												</span>
											</td>
											<td className="max-w-[12rem] truncate px-3 py-2.5 font-medium">
												{item.patientName}
											</td>
											<td className="px-3 py-2.5">
												{paymentMethodLabels[item.method]}
												<span className="block max-w-[10rem] truncate text-[12px] text-muted-foreground">
													{item.reference
														? `Ref. ${item.reference}`
														: "Sin referencia"}
												</span>
											</td>
											<td className="px-3 py-2.5 text-right tabular-nums">
												<span className="font-semibold">
													{usd(item.amountUsd)}
												</span>
												{item.amountVes !== null ? (
													<span className="block text-[12px] text-muted-foreground">
														{ves(item.amountVes)}
													</span>
												) : null}
											</td>
											<td className="px-3 py-2.5">
												<span className="flex items-center gap-2">
													<Badge className={paymentStatusStyles[item.status]}>
														{paymentStatusLabels[item.status]}
													</Badge>
													{item.proof ? (
														<Paperclip
															aria-label="Con comprobante"
															className="size-4 text-muted-foreground"
														/>
													) : null}
												</span>
												{item.rejectionReason ? (
													<span className="mt-1 block max-w-[14rem] truncate text-[12px] text-dash-alert">
														{item.rejectionReason}
													</span>
												) : null}
											</td>
											<td className="px-3 py-2 text-right">
												<span className="inline-flex gap-1">
													<ActionButton
														size="small"
														variant="quiet"
														className="h-8 px-3 text-[13px]"
														onClick={() => onReview(item)}
													>
														{item.status === "pending_review"
															? "Revisar"
															: "Ver"}
													</ActionButton>
													<ConfirmButton
														label="Eliminar pago"
														title="¿Eliminar este pago?"
														description="Úsalo solo si lo registraste por error. Las sesiones que cubría volverán a quedar pendientes."
														confirmLabel="Eliminar"
														variant="danger"
														pending={
															remove.isPending && remove.variables === item.id
														}
														className="h-8 w-8 px-0"
														onConfirm={() =>
															run(() => remove.mutateAsync(item.id), {
																success: "Pago eliminado.",
																error: "No pudimos eliminar el pago.",
															})
														}
													>
														<Trash2 aria-hidden="true" className="size-4" />
													</ConfirmButton>
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</>
			)}
		</Panel>
	);
}
