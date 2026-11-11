"use client";

import { cn } from "@helsa/ui/lib/utils";
import { BellRing, Mail, MessageCircle, PartyPopper } from "lucide-react";
import { m } from "motion/react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";

import { useSendReminder } from "@/lib/api/mutations";
import type { PatientBalance } from "@/lib/core/payment/use-cases/load-patient-balances";
import type { PaymentsOverview } from "@/lib/core/payment/use-cases/load-payments-overview";

import { EmptyState, errorMessage } from "../patients/parts";
import { ActionButton, timeAgo } from "../profile/parts";
import { Field, Segmented, TextArea } from "../settings/fields";
import {
	EASE_OUT,
	Panel,
	PanelHeading,
	PatientAvatar,
} from "../therapist/parts";
import { DialogShell } from "./dialog-shell";
import { daysLabel, sessionsLabel, shortDay, usd, ves } from "./format";
import type { RecordTarget } from "./record-payment-dialog";

const agingFills = [
	"bg-chapter-peach",
	"bg-chapter-peach-deep",
	"bg-[color-mix(in_oklch,var(--destructive),white_45%)]",
	"bg-[color-mix(in_oklch,var(--destructive),white_15%)]",
];

const channelLabels = { whatsapp: "WhatsApp", email: "correo" } as const;

/** Who owes what today, how old the debt is, and a way to remind them. */
export function CollectPanel({
	overview,
	onRemind,
	onRecord,
}: {
	overview: PaymentsOverview;
	onRemind: (patient: PatientBalance) => void;
	onRecord: (target: RecordTarget) => void;
}) {
	const { balances, today, rate } = overview;
	const [showAll, setShowAll] = useState(false);
	const owing = balances.patients.filter(
		(item) => item.balanceUsd > 0 || item.noShowUsd > 0,
	);
	const shown = showAll ? owing : owing.slice(0, 6);
	const agingTotal = balances.aging.reduce((sum, item) => sum + item.usd, 0);

	return (
		<Panel aria-labelledby="collect-title" className="xl:col-span-12">
			<PanelHeading id="collect-title" title="Por cobrar">
				<p className="text-[15px] text-muted-foreground tabular-nums">
					{usd(balances.owedUsd)}
					{rate ? ` · ${ves(balances.owedUsd * rate.vesPerUsd)}` : ""}
					{balances.noShowUsd > 0
						? ` · ${usd(balances.noShowUsd)} en inasistencias`
						: ""}
				</p>
			</PanelHeading>

			{owing.length === 0 ? (
				<div className="mt-4">
					<EmptyState icon={PartyPopper} title="Nadie te debe">
						Todas las sesiones atendidas están pagadas o por verificar.
					</EmptyState>
				</div>
			) : (
				<div className="mt-5 grid gap-6 lg:grid-cols-12">
					<div className="lg:col-span-4">
						<h3 className="font-semibold text-[16px]">
							Antigüedad de la deuda
						</h3>
						<div
							role="img"
							aria-label={balances.aging
								.map((item) => `${item.label} ${usd(item.usd)}`)
								.join(", ")}
							className="mt-3 flex h-3 gap-0.5 overflow-hidden rounded-full bg-dash-ground"
						>
							{agingTotal > 0
								? balances.aging.map((item, index) =>
										item.usd > 0 ? (
											<m.span
												key={item.id}
												initial={{ scaleX: 0 }}
												animate={{ scaleX: 1 }}
												transition={{
													duration: 0.6,
													ease: EASE_OUT,
													delay: 0.2 + index * 0.06,
												}}
												style={{
													flexGrow: item.usd,
													transformOrigin: "0% 50%",
												}}
												className={cn("h-full rounded-full", agingFills[index])}
											/>
										) : null,
									)
								: null}
						</div>
						<ul className="mt-3 flex flex-col gap-2">
							{balances.aging.map((item, index) => (
								<li
									key={item.id}
									className="flex items-center gap-2 text-[15px]"
								>
									<span
										aria-hidden="true"
										className={cn(
											"size-2.5 shrink-0 rounded-full",
											agingFills[index],
										)}
									/>
									<span className="flex-1">{item.label}</span>
									<span className="text-[13px] text-muted-foreground">
										{sessionsLabel(item.sessions)}
									</span>
									<span className="w-20 text-right font-semibold tabular-nums">
										{usd(item.usd)}
									</span>
								</li>
							))}
						</ul>
						<p className="mt-3 text-[13px] text-muted-foreground">
							Días desde la sesión. Las sesiones con más de 7 días sin pagar se
							marcan como vencidas.
						</p>
					</div>

					<div className="lg:col-span-8">
						<ul className="flex flex-col gap-1">
							{shown.map((patient) => (
								<li
									key={patient.id}
									className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-2xl px-2 py-3 hover:bg-dash-ground sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:px-3"
								>
									<PatientAvatar name={patient.name} className="size-10" />
									<div className="min-w-0">
										<p className="truncate font-semibold text-[15px]">
											{patient.name}
										</p>
										<p className="truncate text-[13px] text-muted-foreground">
											{patient.sessions.length > 0
												? `${sessionsLabel(patient.sessions.length)} · la más antigua ${shortDay(patient.oldestDay ?? today, today)} (${daysLabel(patient.oldestDaysAgo)})`
												: `${sessionsLabel(patient.noShows.length)} sin asistir`}
										</p>
										<p className="truncate text-[13px] text-muted-foreground">
											{patient.lastReminder
												? `Recordado ${timeAgo(patient.lastReminder.sentAt)} por ${channelLabels[patient.lastReminder.channel]}`
												: "Sin recordatorios"}
											{patient.creditUsd > 0
												? ` · ${usd(patient.creditUsd)} a favor`
												: ""}
											{patient.reviewUsd > 0
												? ` · ${usd(patient.reviewUsd)} por verificar`
												: ""}
										</p>
									</div>
									<p className="col-start-2 text-left font-semibold text-[17px] tabular-nums sm:col-start-auto sm:text-right">
										{usd(patient.balanceUsd)}
										{patient.noShowUsd > 0 ? (
											<span className="block font-normal text-[13px] text-muted-foreground">
												+{usd(patient.noShowUsd)} inasistencias
											</span>
										) : null}
									</p>
									<div className="col-start-2 flex gap-2 sm:col-start-auto">
										<ActionButton
											size="small"
											variant="quiet"
											onClick={() => onRemind(patient)}
										>
											<BellRing aria-hidden="true" className="size-4" />
											Recordar
										</ActionButton>
										<ActionButton
											size="small"
											variant="quiet"
											onClick={() =>
												onRecord({
													patientId: patient.id,
													sessionIds: patient.sessions.map((item) => item.id),
												})
											}
										>
											Registrar pago
										</ActionButton>
									</div>
								</li>
							))}
						</ul>
						{owing.length > shown.length || showAll ? (
							<button
								type="button"
								onClick={() => setShowAll((value) => !value)}
								className="mt-2 inline-flex h-9 items-center rounded-full px-3 font-semibold text-[14px] text-dash-link outline-none hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring"
							>
								{showAll ? "Ver menos" : `Ver los ${owing.length} pacientes`}
							</button>
						) : null}
					</div>
				</div>
			)}
		</Panel>
	);
}

// ─── Reminder ────────────────────────────────────────────────────────────────

function draftMessage(patient: PatientBalance, overview: PaymentsOverview) {
	const { today, rate, therapist } = overview;
	const sessions = [...patient.sessions, ...patient.noShows];
	const total = patient.balanceUsd + patient.noShowUsd;
	const days = sessions.map((item) => shortDay(item.day, today)).join(", ");
	const amount = rate
		? `${usd(total)} (${ves(total * rate.vesPerUsd)} a tasa ${rate.source})`
		: usd(total);
	const lines = [
		`Hola, ${patient.shortName}. Espero que estés bien.`,
		"",
		`Te escribo para recordarte que tienes ${sessions.length === 1 ? "1 sesión pendiente" : `${sessions.length} sesiones pendientes`} de pago (${days}) por un total de ${amount}.`,
	];
	if (patient.creditUsd > 0)
		lines.push(`Ya descontamos ${usd(patient.creditUsd)} que tenías a favor.`);
	if (therapist.paymentInstructions)
		lines.push("", therapist.paymentInstructions);
	lines.push(
		"",
		"Cuando hagas el pago, por favor envíame el comprobante. ¡Gracias!",
		therapist.name,
	);
	return lines.join("\n");
}

export function ReminderDialog({
	patient,
	overview,
	onClose,
}: {
	patient: PatientBalance | null;
	overview: PaymentsOverview;
	onClose: () => void;
}) {
	return (
		<DialogShell
			open={patient !== null}
			onOpenChange={(open) => (open ? null : onClose())}
			title={patient ? `Recordar a ${patient.shortName}` : "Recordar pago"}
			description={
				overview.automatedChannels.whatsapp || overview.automatedChannels.email
					? "Revisa el mensaje antes de enviarlo."
					: "Revisa el mensaje antes de enviarlo. Se abrirá tu WhatsApp o tu correo con el texto listo."
			}
		>
			{patient ? (
				<ReminderForm
					key={patient.id}
					patient={patient}
					overview={overview}
					onDone={onClose}
				/>
			) : null}
		</DialogShell>
	);
}

function ReminderForm({
	patient,
	overview,
	onDone,
}: {
	patient: PatientBalance;
	overview: PaymentsOverview;
	onDone: () => void;
}) {
	const id = useId();
	const router = useRouter();
	const send = useSendReminder();
	const channels = [
		patient.phone ? (["whatsapp", "WhatsApp"] as const) : null,
		patient.email ? (["email", "Correo"] as const) : null,
	].filter((item) => item !== null);
	const [channel, setChannel] = useState<"whatsapp" | "email">(
		channels[0]?.[0] ?? "whatsapp",
	);
	const [message, setMessage] = useState(() => draftMessage(patient, overview));
	// Helsa delivers it (Kapso / Resend) instead of opening the therapist's app.
	// WhatsApp from Helsa's line also needs the patient's opt-in.
	const automated =
		channel === "whatsapp"
			? overview.automatedChannels.whatsapp && patient.whatsappOptIn
			: overview.automatedChannels.email;
	// Helsa's WhatsApp line only sends the approved template, not this text.
	const usesTemplate = automated && channel === "whatsapp";

	async function submit(event: React.FormEvent) {
		event.preventDefault();
		// Opened now, while the click still counts, so the browser doesn't block it.
		const popup =
			channel === "whatsapp" && !automated ? window.open("", "_blank") : null;
		try {
			const delivery = await send.mutateAsync({
				patientId: patient.id,
				channel,
				message,
			});
			if (delivery.status === "handoff") {
				if (popup) {
					popup.opener = null;
					popup.location.href = delivery.url;
				} else {
					window.location.href = delivery.url;
				}
				toast.success(
					`Abrimos ${channel === "whatsapp" ? "WhatsApp" : "tu correo"} con el mensaje listo.`,
					{
						description: "Lo registramos como recordatorio enviado.",
					},
				);
			} else {
				popup?.close();
				toast.success("Recordatorio enviado.");
			}
			router.refresh();
			onDone();
		} catch (error) {
			popup?.close();
			toast.error(errorMessage(error, "No pudimos preparar el recordatorio."));
		}
	}

	if (channels.length === 0) {
		return (
			<div className="flex flex-col gap-4">
				<p className="rounded-2xl bg-chapter-peach px-5 py-4">
					{patient.name} no tiene teléfono ni correo registrado. Agrégalos en su
					ficha para poder recordarle.
				</p>
				<div className="flex justify-end gap-2">
					<ActionButton size="small" variant="quiet" onClick={onDone}>
						Cerrar
					</ActionButton>
					<a
						href={`/dashboard/patients/${patient.id}/edit`}
						className="inline-flex h-10 items-center rounded-full bg-chapter-violet px-4 font-semibold text-[14px] text-white outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						Editar paciente
					</a>
				</div>
			</div>
		);
	}

	return (
		<form onSubmit={submit} className="flex flex-col gap-5">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<Segmented
					label="Enviar por"
					options={channels}
					value={channel}
					onChange={setChannel}
				/>
				<p className="text-[14px] text-muted-foreground">
					{channel === "whatsapp" ? patient.phone : patient.email}
				</p>
			</div>
			{channel === "whatsapp" && !patient.whatsappOptIn ? (
				<p className="rounded-2xl bg-dash-ground px-5 py-3 text-[14px]">
					Este paciente no autorizó recordatorios automáticos por WhatsApp.
					Puedes escribirle tú desde tu teléfono.
				</p>
			) : null}
			{usesTemplate ? (
				<p className="rounded-2xl bg-dash-ground px-5 py-3 text-[14px]">
					Le llegará desde el WhatsApp de Helsa un mensaje estándar con tu
					nombre, las sesiones pendientes y el monto total. Si quieres enviarle
					tu propio texto, elige correo.
				</p>
			) : (
				<Field id={`${id}-message`} label="Mensaje">
					<TextArea
						id={`${id}-message`}
						value={message}
						onValueChange={setMessage}
						maxLength={1500}
						className="min-h-64"
					/>
				</Field>
			)}
			<div className="flex flex-wrap justify-end gap-2">
				<ActionButton size="small" variant="quiet" onClick={onDone}>
					Cancelar
				</ActionButton>
				<ActionButton
					type="submit"
					size="small"
					pending={send.isPending}
					disabled={!usesTemplate && message.trim().length < 10}
				>
					{channel === "whatsapp" ? (
						<MessageCircle aria-hidden="true" className="size-4" />
					) : (
						<Mail aria-hidden="true" className="size-4" />
					)}
					{automated
						? "Enviar recordatorio"
						: channel === "whatsapp"
							? "Abrir WhatsApp"
							: "Abrir correo"}
				</ActionButton>
			</div>
		</form>
	);
}
