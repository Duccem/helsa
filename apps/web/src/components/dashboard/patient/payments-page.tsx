"use client";

import { cn } from "@helsa/ui/lib/utils";
import { Check, Clock, Paperclip, Receipt, Send, X } from "lucide-react";
import { m } from "motion/react";
import { useId, useRef, useState } from "react";

import { useReportPayment } from "@/lib/api/mutations";
import { VES_METHODS } from "@/lib/core/payment/domain/billing";
import type {
	PatientPayments,
	PortalPayment,
} from "@/lib/core/payment/use-cases/load-patient-payments";
import { EmptyState, formatDay, useRefreshingAction } from "../patients/parts";
import { formatBytes } from "../patients/schema";
import { DialogShell } from "../payments/dialog-shell";
import { ActionButton } from "../profile/parts";
import {
	Field,
	FieldError,
	NumberInput,
	Segmented,
	SelectInput,
	TextArea,
	TextInput,
} from "../settings/fields";
import { type PaymentMethod, paymentMethods } from "../settings/schema";
import { Panel, PanelHeading, stagger } from "../therapist/parts";
import {
	Badge,
	methodLabel,
	PageHeader,
	paymentStatusBadges,
	shortDay,
	usd,
	ves,
} from "./parts";
import { type ReportPaymentInput, reportPaymentSchema } from "./schema";

const PROOF_ACCEPT =
	"image/jpeg,image/png,image/webp,image/heic,application/pdf";

export function PatientPaymentsPage({ data }: { data: PatientPayments }) {
	const [reporting, setReporting] = useState(false);
	const { balance } = data;

	return (
		<m.div
			initial="hidden"
			animate="show"
			variants={stagger(0.08)}
			className="mx-auto max-w-[72rem]"
		>
			<PageHeader
				title="Pagos"
				description={
					balance.owedUsd > 0
						? `Tienes ${usd(balance.owedUsd)} pendientes con ${data.therapist}. Cuando pagues, repórtalo aquí para que lo verifique.`
						: `Estás al día con ${data.therapist}. Si haces un pago o un adelanto, repórtalo aquí.`
				}
			>
				<ActionButton onClick={() => setReporting(true)}>
					<Send aria-hidden="true" className="size-4" />
					Reportar un pago
				</ActionButton>
			</PageHeader>

			<div className="grid gap-4 xl:grid-cols-12">
				<Panel aria-labelledby="balance-title" className="xl:col-span-7">
					<PanelHeading id="balance-title" title="Tu saldo" />
					<div
						className={cn(
							"mt-4 rounded-2xl p-5",
							balance.owedUsd > 0 ? "bg-chapter-peach" : "bg-chapter-teal",
						)}
					>
						<p className="text-[14px]">
							{balance.owedUsd > 0 ? "Por pagar" : "Estás al día"}
						</p>
						<p className="mt-1 font-display font-medium text-[2.75rem] tabular-nums leading-none tracking-[-0.02em]">
							{usd(balance.owedUsd)}
						</p>
						<div className="mt-3 flex flex-col gap-1 text-[14px]">
							{balance.reviewUsd > 0 ? (
								<p className="inline-flex items-center gap-1.5">
									<Clock aria-hidden="true" className="size-3.5" />
									{usd(balance.reviewUsd)} esperando que tu terapeuta los
									verifique
								</p>
							) : null}
							{balance.creditUsd > 0 ? (
								<p>
									Tienes {usd(balance.creditUsd)} a favor para tus próximas
									sesiones.
								</p>
							) : null}
						</div>
					</div>

					{balance.sessions.length > 0 ? (
						<>
							<h3 className="mt-6 font-semibold text-[15px]">
								Sesiones por pagar
							</h3>
							<ul className="mt-2 divide-y divide-border">
								{balance.sessions.map((session) => (
									<li
										key={session.id}
										className="flex items-center justify-between gap-3 py-3"
									>
										<div className="min-w-0">
											<p className="font-semibold text-[15px]">
												{formatDay(session.day)}
											</p>
											<p className="text-[14px] text-muted-foreground">
												Sesión de {usd(session.priceUsd)}
												{session.paidUsd > 0
													? ` · pagaste ${usd(session.paidUsd)}`
													: ""}
											</p>
										</div>
										<div className="flex shrink-0 items-center gap-2">
											{session.overdue ? (
												<Badge className="bg-destructive/12 text-dash-alert">
													Vencida
												</Badge>
											) : null}
											<span className="font-semibold text-[15px] tabular-nums">
												{usd(session.dueUsd)}
											</span>
										</div>
									</li>
								))}
							</ul>
						</>
					) : null}
				</Panel>

				<Panel aria-labelledby="how-title" className="xl:col-span-5">
					<PanelHeading id="how-title" title="Cómo pagar" />
					{data.payWith.methods.length > 0 ? (
						<ul className="mt-4 flex flex-wrap gap-1.5">
							{data.payWith.methods.map((method) => (
								<li
									key={method}
									className="rounded-full bg-dash-ground px-3 py-1.5 text-[14px]"
								>
									{methodLabel(method)}
								</li>
							))}
						</ul>
					) : null}
					<p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed">
						{data.payWith.instructions ??
							"Tu terapeuta aún no ha cargado sus datos de pago. Pregúntale directamente."}
					</p>
					{data.rate ? (
						<p className="mt-4 rounded-2xl bg-dash-ground p-4 text-[14px] leading-snug">
							Tasa de referencia ({data.rate.source}):{" "}
							<span className="font-semibold tabular-nums">
								{ves(data.rate.vesPerUsd)}
							</span>{" "}
							por dólar
							{data.rate.date ? `, del ${formatDay(data.rate.date)}` : ""}.
						</p>
					) : null}
				</Panel>

				<Panel aria-labelledby="history-title" className="xl:col-span-12">
					<PanelHeading id="history-title" title="Historial de pagos" />
					{data.payments.length === 0 ? (
						<div className="mt-4">
							<EmptyState icon={Receipt} title="Aún no hay pagos">
								Los pagos que reportes o que registre tu terapeuta aparecerán
								aquí.
							</EmptyState>
						</div>
					) : (
						<ul className="mt-2 divide-y divide-border">
							{data.payments.map((payment) => (
								<PaymentRow
									key={payment.id}
									payment={payment}
									today={data.today}
								/>
							))}
						</ul>
					)}
				</Panel>
			</div>

			<ReportPaymentDialog
				open={reporting}
				onOpenChange={setReporting}
				data={data}
			/>
		</m.div>
	);
}

function PaymentRow({
	payment,
	today,
}: {
	payment: PortalPayment;
	today: string;
}) {
	const status = paymentStatusBadges[payment.status];
	const details = [
		methodLabel(payment.method),
		payment.ves !== null ? ves(payment.ves) : null,
		payment.sessionDay
			? `sesión del ${shortDay(payment.sessionDay)}`
			: "adelanto",
		payment.reference ? `ref. ${payment.reference}` : null,
	].filter(Boolean);

	return (
		<li className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
			<div className="min-w-0">
				<p className="text-[15px]">
					<span className="font-semibold tabular-nums">{usd(payment.usd)}</span>{" "}
					<span className="text-muted-foreground">
						· {payment.day === today ? "hoy" : formatDay(payment.day)}
					</span>
				</p>
				<p className="text-[14px] text-muted-foreground">
					{details.join(" · ")}
					{payment.reportedBy === "patient" ? " · reportado por ti" : ""}
				</p>
				{payment.status === "rejected" && payment.rejectionReason ? (
					<p className="mt-1 text-[14px] text-dash-alert">
						Motivo: {payment.rejectionReason}
					</p>
				) : null}
			</div>
			<Badge className={cn("self-start sm:self-auto", status.className)}>
				{payment.status === "verified" ? (
					<Check aria-hidden="true" className="size-3.5" />
				) : null}
				{status.label}
			</Badge>
		</li>
	);
}

type FormState = Omit<ReportPaymentInput, "reference" | "note"> & {
	reference: string;
	note: string;
};

function initialForm(data: PatientPayments): FormState {
	const method = (data.payWith.methods[0] ?? "pago_movil") as PaymentMethod;
	return {
		sessionIds: data.balance.sessions.map((session) => session.id),
		method,
		currency: VES_METHODS.has(method) ? "ves" : "usd",
		amountUsd: data.balance.owedUsd > 0 ? data.balance.owedUsd : null,
		amountVes: null,
		vesPerUsd: data.rate?.vesPerUsd ?? null,
		paidOn: data.today,
		reference: "",
		note: "",
	};
}

function ReportPaymentDialog({
	open,
	onOpenChange,
	data,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: PatientPayments;
}) {
	const id = useId();
	const report = useReportPayment();
	const run = useRefreshingAction();
	const fileRef = useRef<HTMLInputElement>(null);
	const [form, setForm] = useState<FormState>(() => initialForm(data));
	const [proof, setProof] = useState<File | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const accepted = data.payWith.methods.filter((method) =>
		(paymentMethods as readonly string[]).includes(method),
	) as PaymentMethod[];
	const methodOptions = (accepted.length > 0 ? accepted : paymentMethods).map(
		(method) => [method, methodLabel(method)] as const,
	);
	const selected = data.balance.sessions.filter((session) =>
		form.sessionIds.includes(session.id),
	);
	const selectedUsd = selected.reduce(
		(sum, session) => sum + session.dueUsd,
		0,
	);

	function set<K extends keyof FormState>(key: K, value: FormState[K]) {
		setForm((current) => ({ ...current, [key]: value }));
		setErrors((current) => ({ ...current, [key]: "" }));
	}

	function reset(next: boolean) {
		if (!next) {
			setForm(initialForm(data));
			setProof(null);
			setErrors({});
		}
		onOpenChange(next);
	}

	async function submit(event: React.FormEvent) {
		event.preventDefault();
		const parsed = reportPaymentSchema.safeParse(form);
		if (!parsed.success) {
			const next: Record<string, string> = {};
			for (const issue of parsed.error.issues) {
				const key = String(issue.path[0]);
				next[key] ??= issue.message;
			}
			setErrors(next);
			return;
		}

		const done = await run(() => report.mutateAsync({ ...form, proof }), {
			success: "Pago enviado. Tu terapeuta lo verificará pronto.",
			error: "No pudimos enviar el pago.",
		});
		if (done) reset(false);
	}

	return (
		<DialogShell
			open={open}
			onOpenChange={reset}
			title="Reportar un pago"
			description="Cuéntale a tu terapeuta qué pagaste. Contará en tu saldo cuando lo verifique."
		>
			<form onSubmit={submit} className="space-y-5" noValidate>
				<Field id={`${id}-method`} label="Cómo pagaste" error={errors.method}>
					<SelectInput
						id={`${id}-method`}
						value={form.method}
						options={methodOptions}
						onValueChange={(value) => {
							const method = value as PaymentMethod;
							setForm((current) => ({
								...current,
								method,
								currency: VES_METHODS.has(method) ? "ves" : "usd",
							}));
						}}
					/>
				</Field>

				<div className="space-y-2">
					<p className="px-5 font-medium text-[15px]">Moneda</p>
					<Segmented
						label="Moneda"
						options={[
							["usd", "Dólares"],
							["ves", "Bolívares"],
						]}
						value={form.currency}
						onChange={(value) => set("currency", value)}
					/>
				</div>

				{form.currency === "usd" ? (
					<Field id={`${id}-usd`} label="Monto" error={errors.amountUsd}>
						<NumberInput
							id={`${id}-usd`}
							value={form.amountUsd}
							onValueChange={(value) => set("amountUsd", value)}
							nullable
							step={0.01}
							min={0}
							unit="USD"
							invalid={Boolean(errors.amountUsd)}
						/>
					</Field>
				) : (
					<div className="grid gap-5 sm:grid-cols-2">
						<Field id={`${id}-ves`} label="Monto" error={errors.amountVes}>
							<NumberInput
								id={`${id}-ves`}
								value={form.amountVes}
								onValueChange={(value) => set("amountVes", value)}
								nullable
								step={0.01}
								min={0}
								unit="Bs"
								invalid={Boolean(errors.amountVes)}
							/>
						</Field>
						<Field
							id={`${id}-rate`}
							label="Tasa usada"
							error={errors.vesPerUsd}
							hint={
								form.amountVes && form.vesPerUsd
									? `≈ ${usd(form.amountVes / form.vesPerUsd)}`
									: undefined
							}
						>
							<NumberInput
								id={`${id}-rate`}
								value={form.vesPerUsd}
								onValueChange={(value) => set("vesPerUsd", value)}
								nullable
								step={0.0001}
								min={0}
								unit="Bs/$"
								invalid={Boolean(errors.vesPerUsd)}
							/>
						</Field>
					</div>
				)}

				<div className="grid gap-5 sm:grid-cols-2">
					<Field id={`${id}-day`} label="Fecha del pago" error={errors.paidOn}>
						<TextInput
							id={`${id}-day`}
							type="date"
							value={form.paidOn}
							max={data.today}
							onValueChange={(value) => set("paidOn", value)}
							invalid={Boolean(errors.paidOn)}
						/>
					</Field>
					<Field
						id={`${id}-reference`}
						label="Referencia (opcional)"
						error={errors.reference}
					>
						<TextInput
							id={`${id}-reference`}
							value={form.reference}
							maxLength={80}
							onValueChange={(value) => set("reference", value)}
							placeholder="Últimos dígitos"
						/>
					</Field>
				</div>

				{data.balance.sessions.length > 0 ? (
					<fieldset className="space-y-2">
						<legend className="px-5 font-medium text-[15px]">
							Qué estás pagando
						</legend>
						<ul className="flex flex-col gap-1.5">
							{data.balance.sessions.map((session) => {
								const on = form.sessionIds.includes(session.id);
								return (
									<li key={session.id}>
										<label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-dash-ground px-4 py-3 text-[15px] has-focus-visible:ring-2 has-focus-visible:ring-ring">
											<input
												type="checkbox"
												checked={on}
												onChange={() =>
													set(
														"sessionIds",
														on
															? form.sessionIds.filter(
																	(item) => item !== session.id,
																)
															: [...form.sessionIds, session.id],
													)
												}
												className="size-4 accent-chapter-violet"
											/>
											<span className="flex-1">
												Sesión del {formatDay(session.day)}
											</span>
											<span className="font-semibold tabular-nums">
												{usd(session.dueUsd)}
											</span>
										</label>
									</li>
								);
							})}
						</ul>
						<p className="px-5 text-[14px] text-foreground/70">
							{selected.length === 0
								? "Sin sesiones elegidas: quedará como adelanto."
								: `Elegiste ${usd(selectedUsd)}. Si pagas de más, lo demás queda a tu favor.`}
						</p>
					</fieldset>
				) : null}

				<div className="space-y-2">
					<p className="px-5 font-medium text-[15px]">
						Comprobante (recomendado)
					</p>
					<input
						ref={fileRef}
						type="file"
						accept={PROOF_ACCEPT}
						className="sr-only"
						id={`${id}-proof`}
						onChange={(event) => setProof(event.target.files?.[0] ?? null)}
					/>
					{proof ? (
						<div className="flex items-center gap-3 rounded-2xl bg-dash-ground px-4 py-3 text-[15px]">
							<Paperclip aria-hidden="true" className="size-4 shrink-0" />
							<span className="min-w-0 flex-1 truncate">{proof.name}</span>
							<span className="shrink-0 text-[13px] text-muted-foreground">
								{formatBytes(proof.size)}
							</span>
							<button
								type="button"
								aria-label="Quitar comprobante"
								onClick={() => {
									setProof(null);
									if (fileRef.current) fileRef.current.value = "";
								}}
								className="inline-flex size-8 items-center justify-center rounded-full outline-none hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring"
							>
								<X aria-hidden="true" className="size-4" />
							</button>
						</div>
					) : (
						<label
							htmlFor={`${id}-proof`}
							className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-foreground/20 border-dashed px-4 py-5 text-[15px] transition-colors hover:bg-dash-ground"
						>
							<Paperclip aria-hidden="true" className="size-4" />
							Subir captura o PDF (hasta 4 MB)
						</label>
					)}
				</div>

				<Field id={`${id}-note`} label="Nota (opcional)" error={errors.note}>
					<TextArea
						id={`${id}-note`}
						value={form.note}
						onValueChange={(value) => set("note", value)}
						maxLength={500}
						className="min-h-24"
					/>
				</Field>

				<FieldError message={errors.sessionIds} />

				<div className="flex flex-wrap justify-end gap-2">
					<ActionButton variant="quiet" onClick={() => reset(false)}>
						Cancelar
					</ActionButton>
					<ActionButton
						type="submit"
						pending={report.isPending}
						pendingLabel="Enviando…"
					>
						Enviar pago
					</ActionButton>
				</div>
			</form>
		</DialogShell>
	);
}
