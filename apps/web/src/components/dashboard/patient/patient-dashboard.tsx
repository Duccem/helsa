"use client";

import { cn } from "@helsa/ui/lib/utils";
import { CalendarDays, Check, Clock, Repeat } from "lucide-react";
import { m } from "motion/react";

import { JoinSessionLink } from "@/components/video/session-actions";
import type {
	PatientHome,
	PatientHomeAppointment,
	PatientHomeTask,
} from "@/lib/core/patient/use-cases/load-patient-home";

import { formatDay } from "../patients/parts";
import { taskFrequencyLabels } from "../patients/schema";
import {
	formatDuration,
	modalityIcons,
	modalityLabels,
	relativeDay,
	stateLabels,
} from "../schedule/format";
import {
	clinicNow,
	dayNames,
	formatTime,
	greeting,
	monthNames,
} from "../therapist/clinic-time";
import {
	itemIn,
	Panel,
	PanelHeading,
	PanelLink,
	panelIn,
	stagger,
} from "../therapist/parts";
import {
	JOIN_EARLY_MINUTES,
	methodLabel,
	paymentStatusBadges,
	shortDay,
	taskBadges,
	usd,
	useNow,
} from "./parts";

const MINUTE = 60_000;
function countdown(item: PatientHomeAppointment, today: string, now: number) {
	const startsIn = Math.round((Date.parse(item.startsAt) - now) / MINUTE);
	if (startsIn <= 0) return "Tu sesión está en curso";
	const when = relativeDay(item.day, today);
	if (when === "Hoy" && startsIn < 60)
		return `Empieza en ${Math.max(1, startsIn)} min`;
	return `${when} a las ${formatTime(item.time)}`;
}

function pendingTasks(tasks: PatientHomeTask[]) {
	return tasks.filter(
		(task) => task.state === "to_answer" || task.state === "overdue",
	).length;
}

export function PatientDashboard({
	name,
	home,
}: {
	name: string;
	home: PatientHome;
}) {
	const now = useNow(home.nowIso);
	const clock = clinicNow(new Date(now), home.timezone);
	const firstName = name.split(" ")[0] ?? name;
	const upcoming = home.appointments.filter(
		(item) => Date.parse(item.endsAt) > now,
	);
	const next = upcoming[0] ?? null;
	const toDo = pendingTasks(home.tasks);
	const { balance } = home;

	const overview = [
		{
			value: next ? relativeDay(next.day, home.today) : "Sin citas",
			label: "próxima cita",
			note: next
				? `${formatTime(next.time)} · ${modalityLabels[next.modality]}`
				: "Aún no tienes citas agendadas",
		},
		{
			value: usd(balance.owedUsd),
			label: "por pagar",
			note:
				balance.reviewUsd > 0
					? `${usd(balance.reviewUsd)} en revisión`
					: balance.owedUsd > 0
						? balance.sessions.length === 1
							? "De 1 sesión"
							: `De ${balance.sessions.length} sesiones`
						: "Estás al día",
		},
		{
			value: String(toDo),
			label: toDo === 1 ? "tarea por responder" : "tareas por responder",
			note:
				home.tasks.length === 0
					? "No tienes tareas asignadas"
					: `${home.tasks.length} ${home.tasks.length === 1 ? "tarea activa" : "tareas activas"}`,
		},
	];

	return (
		<m.div
			initial="hidden"
			animate="show"
			variants={stagger(0.08)}
			className="mx-auto max-w-[96rem]"
		>
			<m.header variants={itemIn} className="pt-2 pb-8">
				<h1 className="font-display font-medium text-[clamp(2.25rem,4vw,3.5rem)] leading-[1] tracking-[-0.03em]">
					{greeting(clock.minutes)}, {firstName}
				</h1>
				<p className="mt-3 text-[17px] leading-relaxed">
					{dayNames[clock.weekday]} {clock.day} de {monthNames[clock.month - 1]}
					. Te acompaña{" "}
					<span className="font-semibold">{home.therapist.name}</span>
					{home.therapist.title ? `, ${home.therapist.title}` : ""}.
				</p>
			</m.header>

			<div className="grid gap-4 xl:grid-cols-12">
				<Panel aria-label="Resumen" className="xl:col-span-12">
					<m.dl
						variants={stagger(0.06)}
						className="grid gap-x-6 gap-y-6 sm:grid-cols-3"
					>
						{overview.map((item) => (
							<m.div
								key={item.label}
								variants={itemIn}
								className="flex flex-col"
							>
								<dt className="order-2 mt-1 text-[15px]">{item.label}</dt>
								<dd className="order-1 font-display font-medium text-[clamp(2rem,3vw,2.75rem)] tabular-nums leading-none tracking-[-0.02em]">
									{item.value}
								</dd>
								<dd className="order-3 mt-0.5 text-[14px] text-muted-foreground">
									{item.note}
								</dd>
							</m.div>
						))}
					</m.dl>
				</Panel>

				<NextAppointment
					next={next}
					today={home.today}
					now={now}
					therapist={home.therapist.name}
				/>
				<TasksPanel tasks={home.tasks} today={home.today} />
				<UpcomingList items={upcoming.slice(1)} today={home.today} />
				<PaymentsPanel
					balance={balance}
					payWith={home.payWith}
					today={home.today}
				/>
			</div>
		</m.div>
	);
}

function NextAppointment({
	next,
	today,
	now,
	therapist,
}: {
	next: PatientHomeAppointment | null;
	today: string;
	now: number;
	therapist: string;
}) {
	if (!next) {
		return (
			<m.section
				variants={panelIn}
				aria-labelledby="next-title"
				className="rounded-[1.75rem] bg-chapter-violet p-6 text-white xl:col-span-5"
			>
				<h2
					id="next-title"
					className="font-display font-medium text-3xl leading-tight"
				>
					No tienes citas próximas
				</h2>
				<p className="mt-3 text-[16px] text-white/85">
					Cuando {therapist} agende tu próxima sesión, la verás aquí.
				</p>
			</m.section>
		);
	}

	const Icon = modalityIcons[next.modality];
	const startsIn = (Date.parse(next.startsAt) - now) / MINUTE;
	const canJoin = next.modality === "video" && startsIn <= JOIN_EARLY_MINUTES;

	return (
		<m.section
			variants={panelIn}
			aria-labelledby="next-title"
			className="flex flex-col rounded-[1.75rem] bg-chapter-violet p-6 text-white xl:col-span-5"
		>
			<p className="text-[14px] text-white/75">Tu próxima sesión</p>
			<h2
				id="next-title"
				className="mt-1 font-display font-medium text-[2rem] leading-[1.05] tracking-[-0.02em]"
				aria-live="polite"
			>
				{countdown(next, today, now)}
			</h2>

			<dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-[15px]">
				<div>
					<dt className="text-[13px] text-white/70">Duración</dt>
					<dd className="font-semibold tabular-nums">
						{formatDuration(next.minutes)}
					</dd>
				</div>
				<div>
					<dt className="text-[13px] text-white/70">Modalidad</dt>
					<dd className="inline-flex items-center gap-1.5 font-semibold">
						<Icon aria-hidden="true" className="size-4" />
						{modalityLabels[next.modality]}
					</dd>
				</div>
				<div>
					<dt className="text-[13px] text-white/70">Estado</dt>
					<dd className="font-semibold">{stateLabels[next.status]}</dd>
				</div>
				<div>
					<dt className="text-[13px] text-white/70">Con</dt>
					<dd className="font-semibold">{therapist}</dd>
				</div>
				{next.location ? (
					<div className="col-span-2">
						<dt className="text-[13px] text-white/70">Lugar</dt>
						<dd className="font-semibold">{next.location}</dd>
					</div>
				) : null}
			</dl>

			<div className="mt-6 xl:mt-auto xl:pt-6">
				{canJoin ? (
					<JoinSessionLink
						appointmentId={next.id}
						className="h-12 w-full bg-white px-5 text-[15px] text-chapter-violet hover:-translate-y-0.5 focus-visible:ring-white focus-visible:ring-offset-chapter-violet"
					/>
				) : next.modality === "video" ? (
					<p className="rounded-2xl bg-white/12 p-4 text-[15px] leading-snug">
						El botón para entrar a la videollamada aparecerá aquí{" "}
						{JOIN_EARLY_MINUTES} minutos antes de empezar.
					</p>
				) : next.status === "scheduled" ? (
					<p className="rounded-2xl bg-white/12 p-4 text-[15px] leading-snug">
						Tu terapeuta aún no ha confirmado esta cita.
					</p>
				) : null}
			</div>
		</m.section>
	);
}

function UpcomingList({
	items,
	today,
}: {
	items: PatientHomeAppointment[];
	today: string;
}) {
	return (
		<Panel aria-labelledby="upcoming-title" className="xl:col-span-5">
			<PanelHeading id="upcoming-title" title="Después">
				<PanelLink href="/dashboard/schedule">Ver mis citas</PanelLink>
			</PanelHeading>
			{items.length === 0 ? (
				<p className="mt-4 text-[15px] text-muted-foreground">
					No hay más citas agendadas por ahora.
				</p>
			) : (
				<ul className="mt-4 flex flex-col gap-2">
					{items.map((item) => {
						const Icon = modalityIcons[item.modality];
						return (
							<li
								key={item.id}
								className="flex items-center gap-4 rounded-2xl bg-dash-ground p-4"
							>
								<span className="flex w-14 shrink-0 flex-col items-center leading-none">
									<span className="font-display font-medium text-[1.625rem] tabular-nums">
										{Number(item.day.slice(8))}
									</span>
									<span className="mt-1 text-[13px] text-muted-foreground">
										{monthNames[Number(item.day.slice(5, 7)) - 1]?.slice(0, 3)}
									</span>
								</span>
								<div className="min-w-0 flex-1">
									<p className="font-semibold text-[15px]">
										{relativeDay(item.day, today)} · {formatTime(item.time)}
									</p>
									<p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[14px] text-muted-foreground">
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
								</div>
								<span
									className={cn(
										"shrink-0 rounded-full px-3 py-1 font-semibold text-[13px]",
										item.status === "confirmed" ? "bg-chapter-teal" : "bg-card",
									)}
								>
									{stateLabels[item.status]}
								</span>
							</li>
						);
					})}
				</ul>
			)}
		</Panel>
	);
}

function taskDetail(task: PatientHomeTask, today: string) {
	if (task.state === "not_started")
		return `Empieza el ${formatDay(task.startsOn)}`;
	const parts: string[] = [taskFrequencyLabels[task.frequency]];
	if (task.dueOn) {
		parts.push(
			task.dueOn < today
				? `venció el ${formatDay(task.dueOn)}`
				: task.dueOn === today
					? "vence hoy"
					: `hasta el ${formatDay(task.dueOn)}`,
		);
	}
	if (task.lastEntryDay) {
		parts.push(
			`última respuesta: ${relativeDay(task.lastEntryDay, today).toLowerCase()}`,
		);
	}
	return parts.join(" · ");
}

function TasksPanel({
	tasks,
	today,
}: {
	tasks: PatientHomeTask[];
	today: string;
}) {
	return (
		<Panel aria-labelledby="tasks-title" className="xl:col-span-7">
			<PanelHeading id="tasks-title" title="Tus tareas">
				<PanelLink href="/dashboard/tasks">Responder tareas</PanelLink>
			</PanelHeading>
			{tasks.length === 0 ? (
				<p className="mt-4 text-[15px] text-muted-foreground">
					Tu terapeuta no te ha asignado tareas por ahora.
				</p>
			) : (
				<ul className="mt-4 flex flex-col gap-2">
					{tasks.map((task) => {
						const badge = taskBadges[task.state];
						return (
							<li key={task.id} className="rounded-2xl bg-dash-ground p-4">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<p className="font-semibold text-[16px] leading-snug">
											{task.title}
										</p>
										<p className="mt-0.5 text-[14px] text-muted-foreground">
											{taskDetail(task, today)}
										</p>
									</div>
									<span
										className={cn(
											"inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 font-semibold text-[13px]",
											badge.className,
										)}
									>
										{task.state === "answered" ? (
											<Check aria-hidden="true" className="size-3.5" />
										) : null}
										{badge.label}
									</span>
								</div>
								{task.instructions ? (
									<p className="mt-3 line-clamp-3 whitespace-pre-line text-[15px] leading-relaxed">
										{task.instructions}
									</p>
								) : null}
							</li>
						);
					})}
				</ul>
			)}
		</Panel>
	);
}

function PaymentsPanel({
	balance,
	payWith,
	today,
}: {
	balance: PatientHome["balance"];
	payWith: PatientHome["payWith"];
	today: string;
}) {
	const overdue = balance.sessions.filter((session) => session.overdue);

	return (
		<Panel aria-labelledby="payments-title" className="xl:col-span-7">
			<PanelHeading id="payments-title" title="Tus pagos">
				<PanelLink href="/dashboard/payments">
					{balance.owedUsd > 0 ? "Reportar un pago" : "Ver pagos"}
				</PanelLink>
			</PanelHeading>

			<div className="mt-4 grid gap-4 lg:grid-cols-2">
				<div
					className={cn(
						"rounded-2xl p-5",
						balance.owedUsd > 0 ? "bg-chapter-peach" : "bg-chapter-teal",
					)}
				>
					<p className="text-[14px]">
						{balance.owedUsd > 0 ? "Saldo pendiente" : "Estás al día"}
					</p>
					<p className="mt-1 font-display font-medium text-[2.5rem] tabular-nums leading-none tracking-[-0.02em]">
						{usd(balance.owedUsd)}
					</p>
					{balance.owedUsd > 0 ? (
						<p className="mt-2 text-[14px] leading-snug">
							{balance.sessions.length === 1
								? `Sesión del ${shortDay(balance.sessions[0]?.day ?? today)}`
								: `${balance.sessions.length} sesiones, desde el ${shortDay(balance.sessions[0]?.day ?? today)}`}
							{overdue.length > 0
								? `. ${overdue.length === 1 ? "1 vencida" : `${overdue.length} vencidas`}.`
								: "."}
						</p>
					) : balance.creditUsd > 0 ? (
						<p className="mt-2 text-[14px]">
							Tienes {usd(balance.creditUsd)} a favor para tus próximas
							sesiones.
						</p>
					) : null}
					{balance.reviewUsd > 0 ? (
						<p className="mt-2 inline-flex items-center gap-1.5 text-[14px]">
							<Clock aria-hidden="true" className="size-3.5" />
							{usd(balance.reviewUsd)} esperando verificación
						</p>
					) : null}
				</div>

				<div className="rounded-2xl bg-dash-ground p-5">
					<p className="font-semibold text-[15px]">Cómo pagar</p>
					{payWith.methods.length > 0 ? (
						<ul className="mt-2 flex flex-wrap gap-1.5">
							{payWith.methods.map((method) => (
								<li
									key={method}
									className="rounded-full bg-card px-3 py-1 text-[13px]"
								>
									{methodLabel(method)}
								</li>
							))}
						</ul>
					) : null}
					<p className="mt-3 whitespace-pre-line text-[14px] text-muted-foreground leading-relaxed">
						{payWith.instructions ??
							"Pregúntale a tu terapeuta los datos para pagar."}
					</p>
				</div>
			</div>

			<h3 className="mt-6 font-semibold text-[15px]">Pagos recientes</h3>
			{balance.recent.length === 0 ? (
				<p className="mt-2 text-[15px] text-muted-foreground">
					Aún no hay pagos registrados.
				</p>
			) : (
				<ul className="mt-2 divide-y divide-border">
					{balance.recent.map((payment) => {
						const status = paymentStatusBadges[payment.status];
						return (
							<li
								key={payment.id}
								className="flex items-center justify-between gap-3 py-3"
							>
								<div className="flex min-w-0 items-center gap-3">
									<CalendarDays
										aria-hidden="true"
										className="size-4 shrink-0 text-muted-foreground"
									/>
									<p className="min-w-0 text-[15px]">
										<span className="font-semibold tabular-nums">
											{usd(payment.usd)}
										</span>{" "}
										<span className="text-muted-foreground">
											· {methodLabel(payment.method)} ·{" "}
											{payment.day === today ? "hoy" : shortDay(payment.day)}
										</span>
									</p>
								</div>
								<span
									className={cn(
										"shrink-0 rounded-full px-3 py-1 font-semibold text-[13px]",
										status.className,
									)}
								>
									{status.label}
								</span>
							</li>
						);
					})}
				</ul>
			)}
		</Panel>
	);
}
