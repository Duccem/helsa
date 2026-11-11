"use client";

import { CalendarDays, CalendarPlus, Repeat } from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";
import { useId, useState } from "react";

import { JoinSessionLink } from "@/components/video/session-actions";
import {
	useCancelAppointment,
	useConfirmAppointment,
} from "@/lib/api/mutations";
import type {
	PatientAppointments,
	PortalAppointment,
	PortalPastAppointment,
} from "@/lib/core/appointment/use-cases/load-patient-appointments";
import { EmptyState, useRefreshingAction } from "../patients/parts";
import { DialogShell } from "../payments/dialog-shell";
import { ActionButton } from "../profile/parts";
import {
	formatDuration,
	modalityIcons,
	modalityLabels,
	relativeDay,
	stateLabels,
} from "../schedule/format";
import { Field, TextArea } from "../settings/fields";
import { formatTime, monthNames } from "../therapist/clinic-time";
import { Panel, PanelHeading, stagger } from "../therapist/parts";
import { Badge, JOIN_EARLY_MINUTES, PageHeader, useNow } from "./parts";

const MINUTE = 60_000;

const statusBadge: Record<PortalAppointment["status"], string> = {
	scheduled: "bg-chapter-peach",
	confirmed: "bg-chapter-teal",
	completed: "bg-dash-ground",
	cancelled: "bg-destructive/12 text-dash-alert",
	no_show: "bg-chapter-peach",
};

/** Patient-facing words for each status. */
const patientStateLabels: Record<PortalAppointment["status"], string> = {
	...stateLabels,
	scheduled: "Sin confirmar",
	completed: "Asististe",
};

function DateBlock({ day }: { day: string }) {
	return (
		<span className="flex w-14 shrink-0 flex-col items-center leading-none">
			<span className="font-display font-medium text-[1.75rem] tabular-nums">
				{Number(day.slice(8))}
			</span>
			<span className="mt-1 text-[13px] text-muted-foreground">
				{monthNames[Number(day.slice(5, 7)) - 1]?.slice(0, 3)}
			</span>
		</span>
	);
}

export function PatientAppointmentsPage({
	data,
}: {
	data: PatientAppointments;
}) {
	const now = useNow(data.nowIso);
	const upcoming = data.upcoming.filter(
		(item) => Date.parse(item.endsAt) > now,
	);

	return (
		<m.div
			initial="hidden"
			animate="show"
			variants={stagger(0.08)}
			className="mx-auto max-w-[72rem]"
		>
			<PageHeader
				title="Mis citas"
				description={`Tus sesiones con ${data.therapist.name}. Puedes confirmarlas o cancelarlas hasta ${data.noticeHours} h antes.`}
			>
				{data.bookingSlug ? (
					<Link
						href={`/r/${data.bookingSlug}` as never}
						className="inline-flex h-12 items-center gap-2 rounded-full bg-chapter-violet px-6 font-semibold text-[15px] text-white outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.97]"
					>
						<CalendarPlus aria-hidden="true" className="size-4" />
						Agendar una cita
					</Link>
				) : null}
			</PageHeader>

			<div className="grid gap-4 xl:grid-cols-12">
				<Panel aria-labelledby="upcoming-title" className="xl:col-span-7">
					<PanelHeading id="upcoming-title" title="Próximas" />
					{upcoming.length === 0 ? (
						<div className="mt-4">
							<EmptyState icon={CalendarDays} title="No tienes citas próximas">
								{data.bookingSlug
									? "Puedes agendar una nueva cuando quieras."
									: `Cuando ${data.therapist.name} agende tu próxima sesión, la verás aquí.`}
							</EmptyState>
						</div>
					) : (
						<ul className="mt-4 flex flex-col gap-2">
							{upcoming.map((item) => (
								<UpcomingRow
									key={item.id}
									item={item}
									today={data.today}
									now={now}
									noticeHours={data.noticeHours}
								/>
							))}
						</ul>
					)}
				</Panel>

				<Panel aria-labelledby="history-title" className="xl:col-span-5">
					<PanelHeading id="history-title" title="Historial" />
					{data.history.length === 0 ? (
						<p className="mt-4 text-[15px] text-muted-foreground">
							Aquí verás tus sesiones pasadas.
						</p>
					) : (
						<ul className="mt-2 divide-y divide-border">
							{data.history.map((item) => (
								<HistoryRow key={item.id} item={item} today={data.today} />
							))}
						</ul>
					)}
				</Panel>
			</div>
		</m.div>
	);
}

function UpcomingRow({
	item,
	today,
	now,
	noticeHours,
}: {
	item: PortalAppointment;
	today: string;
	now: number;
	noticeHours: number;
}) {
	const confirm = useConfirmAppointment();
	const run = useRefreshingAction();
	const [cancelling, setCancelling] = useState(false);
	const Icon = modalityIcons[item.modality];
	const startsIn = (Date.parse(item.startsAt) - now) / MINUTE;
	const live = startsIn <= 0;
	const canJoin = item.modality === "video" && startsIn <= JOIN_EARLY_MINUTES;

	return (
		<li className="rounded-2xl bg-dash-ground p-4">
			<div className="flex items-start gap-4">
				<DateBlock day={item.day} />
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-start justify-between gap-2">
						<p className="font-semibold text-[16px]">
							{relativeDay(item.day, today)} · {formatTime(item.time)}
						</p>
						<Badge
							className={
								live ? "bg-chapter-violet text-white" : statusBadge[item.status]
							}
						>
							{live ? "En curso" : patientStateLabels[item.status]}
						</Badge>
					</div>
					<p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[14px] text-muted-foreground">
						<span className="inline-flex items-center gap-1">
							<Icon aria-hidden="true" className="size-3.5" />
							{modalityLabels[item.modality]}
						</span>
						<span>{formatDuration(item.minutes)}</span>
						{item.recurring ? (
							<span className="inline-flex items-center gap-1">
								<Repeat aria-hidden="true" className="size-3.5" />
								Recurrente
							</span>
						) : null}
					</p>
					{item.location ? (
						<p className="mt-1 text-[14px]">{item.location}</p>
					) : null}

					<div className="mt-3 flex flex-wrap items-center gap-2">
						{canJoin ? (
							<JoinSessionLink
								appointmentId={item.id}
								className="h-10 bg-chapter-violet px-4 text-[14px] text-white hover:-translate-y-0.5"
							/>
						) : null}
						{item.canConfirm && !live ? (
							<ActionButton
								size="small"
								variant={canJoin ? "quiet" : "primary"}
								pending={confirm.isPending}
								pendingLabel="Confirmando…"
								onClick={() =>
									run(() => confirm.mutateAsync(item.id), {
										success: "Cita confirmada. Tu terapeuta ya lo sabe.",
										error: "No pudimos confirmar la cita.",
									})
								}
							>
								Confirmar asistencia
							</ActionButton>
						) : null}
						{item.canCancel ? (
							<ActionButton
								size="small"
								variant="quiet"
								className="bg-card"
								onClick={() => setCancelling(true)}
							>
								Cancelar cita
							</ActionButton>
						) : !live ? (
							<p className="text-[13px] text-muted-foreground">
								Faltan menos de {noticeHours} h: para cancelar, escríbele a tu
								terapeuta.
							</p>
						) : null}
					</div>
				</div>
			</div>
			{item.canCancel ? (
				<CancelDialog
					open={cancelling}
					onOpenChange={setCancelling}
					item={item}
					today={today}
				/>
			) : null}
		</li>
	);
}

function CancelDialog({
	open,
	onOpenChange,
	item,
	today,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item: PortalAppointment;
	today: string;
}) {
	const id = useId();
	const cancel = useCancelAppointment();
	const run = useRefreshingAction();
	const [reason, setReason] = useState("");

	async function submit(event: React.FormEvent) {
		event.preventDefault();
		const done = await run(
			() => cancel.mutateAsync({ appointmentId: item.id, reason }),
			{
				success: "Cita cancelada. Tu terapeuta verá el aviso.",
				error: "No pudimos cancelar la cita.",
			},
		);
		if (done) {
			setReason("");
			onOpenChange(false);
		}
	}

	return (
		<DialogShell
			open={open}
			onOpenChange={onOpenChange}
			title="¿Cancelar esta cita?"
			description={`${relativeDay(item.day, today)} a las ${formatTime(item.time)}. ${item.recurring ? "Solo se cancela esta sesión; las siguientes siguen en pie." : "Tu terapeuta recibirá el aviso."}`}
		>
			<form onSubmit={submit} className="space-y-5">
				<Field id={`${id}-reason`} label="Motivo (opcional)">
					<TextArea
						id={`${id}-reason`}
						value={reason}
						onValueChange={setReason}
						maxLength={300}
						className="min-h-28"
						placeholder="Por ejemplo: tengo un viaje de trabajo."
					/>
				</Field>
				<div className="flex flex-wrap justify-end gap-2">
					<ActionButton variant="quiet" onClick={() => onOpenChange(false)}>
						Volver
					</ActionButton>
					<ActionButton
						type="submit"
						variant="danger"
						pending={cancel.isPending}
						pendingLabel="Cancelando…"
					>
						Cancelar cita
					</ActionButton>
				</div>
			</form>
		</DialogShell>
	);
}

function HistoryRow({
	item,
	today,
}: {
	item: PortalPastAppointment;
	today: string;
}) {
	const Icon = modalityIcons[item.modality];
	const label =
		item.status === "cancelled"
			? item.cancelledBy === "patient"
				? "Cancelaste"
				: "Cancelada"
			: item.status === "scheduled" || item.status === "confirmed"
				? "Realizada"
				: patientStateLabels[item.status];

	return (
		<li className="flex items-center gap-3 py-3">
			<Icon
				aria-hidden="true"
				className="size-4 shrink-0 text-muted-foreground"
			/>
			<p className="min-w-0 flex-1 text-[15px]">
				<span className="font-semibold">{relativeDay(item.day, today)}</span>{" "}
				<span className="text-muted-foreground">· {formatTime(item.time)}</span>
			</p>
			<Badge
				className={
					item.status === "cancelled" || item.status === "no_show"
						? statusBadge[item.status]
						: "bg-dash-ground"
				}
			>
				{label}
			</Badge>
		</li>
	);
}
