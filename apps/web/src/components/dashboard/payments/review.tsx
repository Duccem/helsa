"use client";

import { cn } from "@helsa/ui/lib/utils";
import { ExternalLink, FileText, ShieldCheck } from "lucide-react";
import { useId, useState } from "react";

import { useReviewPayment } from "@/lib/api/mutations";
import type {
	OverviewPayment,
	PaymentsOverview,
} from "@/lib/core/payment/use-cases/load-payments-overview";

import { EmptyState, useRefreshingAction } from "../patients/parts";
import { ActionButton } from "../profile/parts";
import { Field, TextArea } from "../settings/fields";
import { paymentMethodLabels } from "../settings/schema";
import { Panel, PanelHeading, PatientAvatar } from "../therapist/parts";
import { DialogShell } from "./dialog-shell";
import { proofUrl, rate, shortDay, usd, ves } from "./format";

function Amount({ payment }: { payment: OverviewPayment }) {
	return (
		<span className="tabular-nums">
			<strong>{usd(payment.amountUsd)}</strong>
			{payment.amountVes !== null ? (
				<span className="text-muted-foreground">
					{" "}
					· {ves(payment.amountVes)}
				</span>
			) : null}
		</span>
	);
}

/** Payments waiting for the therapist to check them against their bank. */
export function ReviewQueue({
	overview,
	onReview,
}: {
	overview: PaymentsOverview;
	onReview: (payment: OverviewPayment) => void;
}) {
	const { reviewQueue, today } = overview;
	const total = reviewQueue.reduce((sum, item) => sum + item.amountUsd, 0);

	return (
		<Panel aria-labelledby="review-title" className="xl:col-span-12">
			<PanelHeading id="review-title" title="Por verificar">
				<p className="text-[15px] text-muted-foreground">
					{reviewQueue.length === 0
						? "Todo al día"
						: `${reviewQueue.length} ${reviewQueue.length === 1 ? "pago" : "pagos"} · ${usd(total)}`}
				</p>
			</PanelHeading>
			<p className="mt-1 max-w-[70ch] text-[15px] text-foreground/75">
				Revisa cada comprobante contra tu banco o billetera. Solo los pagos
				verificados cuentan como cobrados.
			</p>

			{reviewQueue.length === 0 ? (
				<div className="mt-4">
					<EmptyState icon={ShieldCheck} title="No hay pagos por verificar">
						Cuando registres un pago sin verificar, o un paciente envíe su
						comprobante, aparecerá aquí.
					</EmptyState>
				</div>
			) : (
				<ul className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
					{reviewQueue.map((payment) => (
						<li
							key={payment.id}
							className="flex flex-col gap-3 rounded-[1.25rem] bg-dash-ground p-4"
						>
							<div className="flex items-center gap-3">
								<PatientAvatar
									name={payment.patientName}
									className="size-9 text-[13px]"
								/>
								<div className="min-w-0 flex-1">
									<p className="truncate font-semibold text-[15px]">
										{payment.patientName}
									</p>
									<p className="truncate text-[13px] text-muted-foreground">
										{paymentMethodLabels[payment.method]} ·{" "}
										{shortDay(payment.day, today)}
										{payment.reportedBy === "patient"
											? " · lo envió el paciente"
											: ""}
									</p>
								</div>
							</div>
							<p className="text-[15px]">
								<Amount payment={payment} />
							</p>
							<p className="text-[13px] text-muted-foreground">
								{payment.reference
									? `Ref. ${payment.reference}`
									: "Sin referencia"}
								{payment.sessionDay
									? ` · Sesión del ${shortDay(payment.sessionDay, today)}`
									: " · Saldo a favor"}
							</p>
							<div className="mt-auto flex flex-wrap items-center gap-2">
								<ActionButton size="small" onClick={() => onReview(payment)}>
									Revisar
								</ActionButton>
								{payment.proof ? (
									<span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
										<FileText aria-hidden="true" className="size-4" /> Con
										comprobante
									</span>
								) : (
									<span className="text-[13px] text-muted-foreground">
										Sin comprobante
									</span>
								)}
							</div>
						</li>
					))}
				</ul>
			)}
		</Panel>
	);
}

export function ReviewDialog({
	payment,
	today,
	onClose,
}: {
	payment: OverviewPayment | null;
	today: string;
	onClose: () => void;
}) {
	return (
		<DialogShell
			open={payment !== null}
			onOpenChange={(open) => (open ? null : onClose())}
			title={
				payment?.status === "pending_review"
					? "Revisar pago"
					: "Detalle del pago"
			}
			description="Compara el comprobante con lo que llegó a tu banco o billetera."
			className="sm:max-w-2xl"
		>
			{payment ? (
				<ReviewBody
					key={payment.id}
					payment={payment}
					today={today}
					onDone={onClose}
				/>
			) : null}
		</DialogShell>
	);
}

function ReviewBody({
	payment,
	today,
	onDone,
}: {
	payment: OverviewPayment;
	today: string;
	onDone: () => void;
}) {
	const id = useId();
	const review = useReviewPayment();
	const run = useRefreshingAction();
	const [rejecting, setRejecting] = useState(false);
	const [reason, setReason] = useState("");
	const proof = payment.proof;
	const url = proof ? proofUrl(payment.patientId, proof.id) : null;
	const isImage = proof?.mimeType.startsWith("image/");

	async function decide(decision: "verify" | "reject") {
		const done = await run(
			() =>
				review.mutateAsync(
					decision === "verify"
						? { paymentId: payment.id, decision }
						: { paymentId: payment.id, decision, reason },
				),
			decision === "verify"
				? {
						success: "Pago verificado.",
						error: "No pudimos verificar el pago.",
					}
				: { success: "Pago rechazado.", error: "No pudimos rechazar el pago." },
		);
		if (done) onDone();
	}

	return (
		<div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
			<div className="min-w-0">
				{url && isImage ? (
					<a
						href={url}
						target="_blank"
						rel="noreferrer"
						className="block overflow-hidden rounded-[1.25rem] bg-dash-ground"
					>
						<img
							src={url}
							alt={`Comprobante de ${payment.patientName}`}
							className="max-h-[22rem] w-full object-contain"
						/>
					</a>
				) : url ? (
					<a
						href={url}
						target="_blank"
						rel="noreferrer"
						className="flex items-center gap-3 rounded-[1.25rem] bg-dash-ground p-5 font-semibold outline-none hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring"
					>
						<FileText aria-hidden="true" className="size-6 shrink-0" />
						<span className="min-w-0 flex-1 truncate">{proof?.name}</span>
						<ExternalLink aria-hidden="true" className="size-4" />
					</a>
				) : (
					<p className="rounded-[1.25rem] bg-dash-ground p-5 text-[15px]">
						Este pago no tiene comprobante. Búscalo por monto y referencia en tu
						banco.
					</p>
				)}
				{url && isImage ? (
					<a
						href={url}
						target="_blank"
						rel="noreferrer"
						className="mt-2 inline-flex items-center gap-1.5 px-1 text-[14px] text-dash-link"
					>
						Abrir en otra pestaña{" "}
						<ExternalLink aria-hidden="true" className="size-3.5" />
					</a>
				) : null}
			</div>

			<div className="flex min-w-0 flex-col gap-4">
				<dl className="grid gap-3 text-[15px]">
					{(
						[
							["Paciente", payment.patientName],
							["Monto", <Amount key="amount" payment={payment} />],
							payment.vesPerUsd
								? ["Tasa", `${rate(payment.vesPerUsd)} Bs/$`]
								: null,
							["Método", paymentMethodLabels[payment.method]],
							["Fecha", shortDay(payment.day, today)],
							["Referencia", payment.reference ?? "—"],
							[
								"Sesión",
								payment.sessionDay
									? shortDay(payment.sessionDay, today)
									: "Sin sesión (saldo a favor)",
							],
							payment.note ? ["Nota", payment.note] : null,
						] as Array<[string, React.ReactNode] | null>
					)
						.filter((row): row is [string, React.ReactNode] => row !== null)
						.map(([label, content]) => (
							<div
								key={label}
								className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2"
							>
								<dt className="text-muted-foreground">{label}</dt>
								<dd className="min-w-0 break-words">{content}</dd>
							</div>
						))}
				</dl>

				{payment.status !== "pending_review" ? (
					<p
						className={cn(
							"rounded-2xl px-4 py-3 text-[14px]",
							payment.status === "verified"
								? "bg-chapter-teal"
								: "bg-destructive/12 text-dash-alert",
						)}
					>
						{payment.status === "verified"
							? `Verificado${payment.verifiedAt ? ` el ${shortDay(payment.verifiedAt.slice(0, 10), today)}` : ""}.`
							: `Rechazado: ${payment.rejectionReason ?? "sin motivo"}.`}
					</p>
				) : null}

				{rejecting ? (
					<Field
						id={`${id}-reason`}
						label="¿Por qué lo rechazas?"
						hint="Lo verás en el historial del pago."
					>
						<TextArea
							id={`${id}-reason`}
							value={reason}
							onValueChange={setReason}
							maxLength={300}
							className="min-h-24"
							placeholder="No llegó a la cuenta, el monto no coincide…"
						/>
					</Field>
				) : null}

				<div
					className={cn(
						"mt-auto flex flex-wrap gap-2",
						rejecting ? "justify-end" : "",
					)}
				>
					{rejecting ? (
						<>
							<ActionButton
								size="small"
								variant="quiet"
								onClick={() => setRejecting(false)}
							>
								Volver
							</ActionButton>
							<ActionButton
								size="small"
								variant="danger"
								disabled={reason.trim().length < 3}
								pending={review.isPending}
								onClick={() => decide("reject")}
							>
								Rechazar pago
							</ActionButton>
						</>
					) : (
						<>
							{payment.status !== "verified" ? (
								<ActionButton
									size="small"
									pending={review.isPending}
									onClick={() => decide("verify")}
								>
									<ShieldCheck aria-hidden="true" className="size-4" />
									Marcar como verificado
								</ActionButton>
							) : null}
							{payment.status !== "rejected" ? (
								<ActionButton
									size="small"
									variant="quiet"
									onClick={() => setRejecting(true)}
								>
									{payment.status === "verified"
										? "Marcar como rechazado"
										: "Rechazar"}
								</ActionButton>
							) : null}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
