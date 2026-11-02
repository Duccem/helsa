"use client";

import { cn } from "@helsa/ui/lib/utils";
import { Check, Paperclip, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useRecordPayment, useUploadFile } from "@/lib/api/mutations";
import { VES_METHODS } from "@/lib/core/payment/domain/billing";
import type { PaymentsOverview } from "@/lib/core/payment/use-cases/load-payments-overview";

import { errorMessage } from "../patients/parts";
import { formatBytes, validateFile } from "../patients/schema";
import { ActionButton } from "../profile/parts";
import {
	Field,
	NumberInput,
	Segmented,
	SelectInput,
	TextArea,
	TextInput,
	ToggleRow,
} from "../settings/fields";
import {
	fieldErrors,
	type PaymentMethod,
	paymentMethodLabels,
	paymentMethods,
} from "../settings/schema";
import { DialogShell } from "./dialog-shell";
import { chargeBadge, chargeBadgeStyles, shortDay, usd } from "./format";
import { type RecordPaymentInput, recordPaymentSchema } from "./schema";

export type RecordTarget = { patientId?: string; sessionIds?: string[] };

const round2 = (value: number) => Math.round(value * 100) / 100;

function initialState(
	overview: PaymentsOverview,
	target: RecordTarget,
): RecordPaymentInput {
	const method: PaymentMethod =
		overview.therapist.paymentMethods[0] ?? "pago_movil";
	const sessionIds = target.sessionIds ?? [];
	const due = overview.openSessions
		.filter((item) => sessionIds.includes(item.id))
		.reduce((sum, item) => sum + item.dueUsd, 0);
	const vesPerUsd = overview.rate?.vesPerUsd ?? null;
	const currency = VES_METHODS.has(method) ? "ves" : "usd";
	return {
		patientId: target.patientId ?? "",
		sessionIds,
		method,
		currency,
		amountUsd: due > 0 ? round2(due) : null,
		amountVes: due > 0 && vesPerUsd ? round2(due * vesPerUsd) : null,
		vesPerUsd,
		paidOn: overview.today,
		reference: "",
		note: "",
		proofFileId: null,
		verified: true,
	};
}

export function RecordPaymentDialog({
	overview,
	target,
	onClose,
}: {
	overview: PaymentsOverview;
	/** null = closed. */
	target: RecordTarget | null;
	onClose: () => void;
}) {
	return (
		<DialogShell
			open={target !== null}
			onOpenChange={(open) => (open ? null : onClose())}
			title="Registrar pago"
			description="Anota el dinero que te envió el paciente. Si cubre varias sesiones, se reparte de la más antigua a la más reciente y lo que sobre queda como saldo a favor."
		>
			{target ? (
				<RecordPaymentForm
					// A new target starts a fresh form.
					key={`${target.patientId ?? ""}:${target.sessionIds?.join(",") ?? ""}`}
					overview={overview}
					target={target}
					onDone={onClose}
				/>
			) : null}
		</DialogShell>
	);
}

function RecordPaymentForm({
	overview,
	target,
	onDone,
}: {
	overview: PaymentsOverview;
	target: RecordTarget;
	onDone: () => void;
}) {
	const id = useId();
	const router = useRouter();
	const fileInput = useRef<HTMLInputElement>(null);
	const [value, setValue] = useState(() => initialState(overview, target));
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [proof, setProof] = useState<File | null>(null);
	const record = useRecordPayment();
	const upload = useUploadFile(value.patientId);
	const pending = record.isPending || upload.isPending;

	const sessions = useMemo(
		() =>
			overview.openSessions.filter(
				(item) => item.patientId === value.patientId,
			),
		[overview.openSessions, value.patientId],
	);
	const selectedDue = round2(
		sessions
			.filter((item) => value.sessionIds.includes(item.id))
			.reduce((sum, item) => sum + item.dueUsd, 0),
	);
	const inVes = value.currency === "ves";
	const equivalentUsd =
		inVes && value.amountVes && value.vesPerUsd
			? round2(value.amountVes / value.vesPerUsd)
			: null;
	const totalUsd = inVes ? equivalentUsd : value.amountUsd;
	const leftover =
		totalUsd !== null && value.sessionIds.length > 0
			? round2(totalUsd - selectedDue)
			: null;

	// Accepted methods first, then the rest.
	const methodOptions = [
		...overview.therapist.paymentMethods,
		...paymentMethods.filter(
			(method) => !overview.therapist.paymentMethods.includes(method),
		),
	].map((method) => [method, paymentMethodLabels[method]] as const);

	function update(patch: Partial<RecordPaymentInput>) {
		setValue((current) => ({ ...current, ...patch }));
		setErrors((current) =>
			Object.fromEntries(
				Object.entries(current).filter(([key]) => !(key in patch)),
			),
		);
	}

	/** Suggest the amount from the sessions picked, in the current currency. */
	function suggest(
		sessionIds: string[],
		currency = value.currency,
		vesPerUsd = value.vesPerUsd,
	) {
		const due = round2(
			sessions
				.filter((item) => sessionIds.includes(item.id))
				.reduce((sum, item) => sum + item.dueUsd, 0),
		);
		if (due <= 0) return {};
		return currency === "ves"
			? { amountVes: vesPerUsd ? round2(due * vesPerUsd) : value.amountVes }
			: { amountUsd: due };
	}

	function toggleSession(sessionId: string) {
		const next = value.sessionIds.includes(sessionId)
			? value.sessionIds.filter((item) => item !== sessionId)
			: [...value.sessionIds, sessionId];
		update({ sessionIds: next, ...suggest(next) });
	}

	function pickFile(file: File | undefined) {
		if (!file) return;
		const problem = validateFile({ type: file.type, size: file.size });
		if (problem || !/^(image\/|application\/pdf)/.test(file.type)) {
			toast.error(problem ?? "Usa una imagen o un PDF.");
			return;
		}
		setProof(file);
	}

	async function submit(event: React.FormEvent) {
		event.preventDefault();
		const parsed = recordPaymentSchema.safeParse(value);
		if (!parsed.success) {
			setErrors(fieldErrors(parsed.error));
			toast.error("Revisa los campos marcados.");
			return;
		}
		try {
			const proofFileId = proof ? (await upload.mutateAsync(proof)).id : null;
			const result = await record.mutateAsync({ ...value, proofFileId });
			toast.success(
				value.verified
					? "Pago registrado y verificado."
					: "Pago registrado. Queda por verificar.",
				result.count > 1
					? { description: `Se repartió en ${result.count} partes.` }
					: undefined,
			);
			router.refresh();
			onDone();
		} catch (error) {
			toast.error(errorMessage(error, "No pudimos registrar el pago."));
		}
	}

	return (
		<form onSubmit={submit} className="flex flex-col gap-5" noValidate>
			<Field id={`${id}-patient`} label="Paciente" error={errors.patientId}>
				<SelectInput
					id={`${id}-patient`}
					value={value.patientId}
					onValueChange={(patientId) => {
						update({ patientId, sessionIds: [] });
						setProof(null);
					}}
					options={[
						["", "Elige un paciente"],
						...overview.patients.map((item) => [item.id, item.name] as const),
					]}
					invalid={Boolean(errors.patientId)}
				/>
			</Field>

			{value.patientId ? (
				<fieldset className="m-0 min-w-0 border-0 p-0">
					<legend className="px-5 font-medium text-[15px]">
						Sesiones que paga
					</legend>
					{sessions.length === 0 ? (
						<p className="mt-2 rounded-2xl bg-dash-ground px-5 py-4 text-[14px]">
							No tiene sesiones pendientes. El pago quedará como saldo a favor.
						</p>
					) : (
						<ul className="mt-2 flex max-h-56 flex-col gap-1 overflow-y-auto rounded-[1.25rem] bg-dash-ground p-2">
							{sessions.map((item) => {
								const on = value.sessionIds.includes(item.id);
								return (
									<li key={item.id}>
										{/* biome-ignore lint/a11y/useSemanticElements: a whole row is the hit target; state is exposed with aria-checked. */}
										<button
											type="button"
											role="checkbox"
											aria-checked={on}
											onClick={() => toggleSession(item.id)}
											className={cn(
												"flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
												on ? "bg-card" : "hover:bg-card/60",
											)}
										>
											<span
												aria-hidden="true"
												className={cn(
													"inline-flex size-5 shrink-0 items-center justify-center rounded-md border-2",
													on
														? "border-chapter-violet bg-chapter-violet text-white"
														: "border-foreground/30",
												)}
											>
												{on ? <Check className="size-3.5" /> : null}
											</span>
											<span className="min-w-0 flex-1">
												{shortDay(item.day, overview.today)} · {item.time}
											</span>
											<span
												className={cn(
													"rounded-full px-2.5 py-0.5 font-semibold text-[12px]",
													chargeBadgeStyles[item.charge],
												)}
											>
												{chargeBadge[item.charge]}
											</span>
											<span className="font-semibold tabular-nums">
												{usd(item.dueUsd)}
											</span>
										</button>
									</li>
								);
							})}
						</ul>
					)}
					{value.sessionIds.length > 0 ? (
						<p className="mt-2 px-5 text-[14px] text-foreground/75">
							Pendiente de lo elegido:{" "}
							<strong className="tabular-nums">{usd(selectedDue)}</strong>
							{leftover !== null && leftover > 0
								? ` · Sobran ${usd(leftover)} como saldo a favor`
								: ""}
							{leftover !== null && leftover < 0
								? ` · Faltan ${usd(-leftover)}`
								: ""}
						</p>
					) : null}
				</fieldset>
			) : null}

			<div className="grid gap-5 sm:grid-cols-2">
				<Field id={`${id}-method`} label="Método" error={errors.method}>
					<SelectInput
						id={`${id}-method`}
						value={value.method}
						onValueChange={(raw) => {
							const method = raw as PaymentMethod;
							const currency = VES_METHODS.has(method) ? "ves" : "usd";
							update({
								method,
								currency,
								...suggest(value.sessionIds, currency),
							});
						}}
						options={methodOptions}
					/>
				</Field>
				<Field id={`${id}-day`} label="Fecha del pago" error={errors.paidOn}>
					<TextInput
						id={`${id}-day`}
						type="date"
						max={overview.today}
						value={value.paidOn}
						onValueChange={(paidOn) => update({ paidOn })}
						invalid={Boolean(errors.paidOn)}
					/>
				</Field>
			</div>

			<div className="flex flex-col gap-3">
				<Segmented
					label="Moneda"
					options={[
						["usd", "Dólares"],
						["ves", "Bolívares"],
					]}
					value={value.currency}
					onChange={(currency) =>
						update({ currency, ...suggest(value.sessionIds, currency) })
					}
				/>
				{inVes ? (
					<div className="grid gap-5 sm:grid-cols-2">
						<Field id={`${id}-ves`} label="Monto" error={errors.amountVes}>
							<NumberInput
								id={`${id}-ves`}
								value={value.amountVes}
								onValueChange={(amountVes) => update({ amountVes })}
								unit="Bs"
								step={0.01}
								nullable
								invalid={Boolean(errors.amountVes)}
							/>
						</Field>
						<Field
							id={`${id}-rate`}
							label="Tasa"
							error={errors.vesPerUsd}
							hint={
								equivalentUsd !== null
									? `Equivale a ${usd(equivalentUsd)}`
									: "Bolívares por dólar"
							}
						>
							<NumberInput
								id={`${id}-rate`}
								value={value.vesPerUsd}
								onValueChange={(vesPerUsd) => update({ vesPerUsd })}
								unit="Bs/$"
								step={0.0001}
								nullable
								invalid={Boolean(errors.vesPerUsd)}
							/>
						</Field>
					</div>
				) : (
					<Field id={`${id}-usd`} label="Monto" error={errors.amountUsd}>
						<NumberInput
							id={`${id}-usd`}
							value={value.amountUsd}
							onValueChange={(amountUsd) => update({ amountUsd })}
							unit="USD"
							step={0.01}
							nullable
							invalid={Boolean(errors.amountUsd)}
						/>
					</Field>
				)}
			</div>

			<Field
				id={`${id}-reference`}
				label="Referencia"
				error={errors.reference}
				hint="Número de operación, para buscarlo en tu banco."
			>
				<TextInput
					id={`${id}-reference`}
					value={value.reference ?? ""}
					onValueChange={(reference) => update({ reference })}
					maxLength={80}
				/>
			</Field>

			<div className="space-y-2">
				<p className="px-5 font-medium text-[15px]">Comprobante</p>
				<input
					ref={fileInput}
					type="file"
					accept="image/jpeg,image/png,image/webp,application/pdf"
					className="sr-only"
					tabIndex={-1}
					onChange={(event) => {
						pickFile(event.target.files?.[0]);
						event.target.value = "";
					}}
				/>
				{proof ? (
					<div className="flex items-center gap-3 rounded-full bg-dash-ground py-2 pr-2 pl-5">
						<Paperclip aria-hidden="true" className="size-4 shrink-0" />
						<span className="min-w-0 flex-1 truncate">{proof.name}</span>
						<span className="text-[13px] text-muted-foreground">
							{formatBytes(proof.size)}
						</span>
						<button
							type="button"
							aria-label="Quitar comprobante"
							onClick={() => setProof(null)}
							className="inline-flex size-8 items-center justify-center rounded-full outline-none hover:bg-card focus-visible:ring-2 focus-visible:ring-ring"
						>
							<X aria-hidden="true" className="size-4" />
						</button>
					</div>
				) : (
					<ActionButton
						size="small"
						variant="quiet"
						disabled={!value.patientId}
						onClick={() => fileInput.current?.click()}
					>
						<Paperclip aria-hidden="true" className="size-4" />
						Adjuntar imagen o PDF
					</ActionButton>
				)}
				<p className="px-5 text-[14px] text-foreground/70">
					Opcional. Se guarda cifrado en los archivos del paciente.
				</p>
			</div>

			<ToggleRow
				title="Ya lo verifiqué"
				detail="Lo vi en mi banco o billetera. Si lo apagas, el pago queda por verificar y no cuenta como cobrado."
				checked={value.verified}
				onCheckedChange={(verified) => update({ verified })}
			/>

			<Field id={`${id}-note`} label="Nota" error={errors.note}>
				<TextArea
					id={`${id}-note`}
					value={value.note ?? ""}
					onValueChange={(note) => update({ note })}
					maxLength={500}
					className="min-h-24"
				/>
			</Field>

			<div className="flex flex-wrap justify-end gap-2">
				<ActionButton size="small" variant="quiet" onClick={onDone}>
					Cancelar
				</ActionButton>
				<ActionButton
					type="submit"
					size="small"
					pending={pending}
					pendingLabel="Guardando…"
				>
					Registrar pago{totalUsd ? ` · ${usd(totalUsd)}` : ""}
				</ActionButton>
			</div>
		</form>
	);
}
