"use client";

import { FileText, MapPin, Phone, Video } from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";

import {
	CopyPatientLink,
	JoinSessionLink,
} from "@/components/video/session-actions";
import type {
	HomeNext,
	TherapistHome,
} from "@/lib/core/therapist/use-cases/load-therapist-home";

import { modalityLabels, stateLabels } from "../schedule/format";
import {
	dayNames,
	formatDuration,
	formatTime,
	monthNames,
} from "./clinic-time";
import { panelIn, usd } from "./parts";

const MINUTE = 60_000;

function weekdayOf(day: string) {
	return (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7;
}

function daysBetween(from: string, to: string) {
	return Math.round(
		(Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
			86_400_000,
	);
}

function countdown(next: HomeNext, today: string, now: number) {
	const startsIn = Math.round((Date.parse(next.startsAt) - now) / MINUTE);
	if (startsIn <= 0 && Date.parse(next.endsAt) > now)
		return "está en sesión ahora";
	const offset = daysBetween(today, next.day);
	if (offset === 0 && startsIn < 60)
		return `empieza en ${Math.max(1, startsIn)} min`;
	if (offset === 0) {
		const hours = Math.floor(startsIn / 60);
		const minutes = startsIn % 60;
		return `empieza en ${hours} h${minutes ? ` ${minutes} min` : ""}`;
	}
	if (offset === 1) return `mañana a las ${formatTime(next.time)}`;
	if (offset < 7)
		return `el ${dayNames[weekdayOf(next.day)]?.toLowerCase()} a las ${formatTime(next.time)}`;
	const [, month = 1, date = 1] = next.day.split("-").map(Number);
	return `el ${date} de ${monthNames[month - 1]} a las ${formatTime(next.time)}`;
}

function shortDate(iso: string, timeZone: string) {
	return new Intl.DateTimeFormat("es", {
		timeZone,
		day: "numeric",
		month: "short",
	}).format(new Date(iso));
}

const actionIcons = { video: Video, in_person: MapPin, phone: Phone } as const;

export function NextSession({
	next,
	today,
	timezone,
	now,
}: {
	next: TherapistHome["next"];
	today: string;
	timezone: string;
	now: number;
}) {
	if (!next) {
		return (
			<m.section
				variants={panelIn}
				aria-labelledby="next-title"
				className="rounded-[1.75rem] bg-chapter-violet p-6 text-white xl:col-span-4"
			>
				<h2
					id="next-title"
					className="font-display font-medium text-3xl leading-tight"
				>
					Sin sesiones próximas
				</h2>
				<p className="mt-3 text-[16px] text-white/85">
					Comparte tu enlace de reservas para llenar tu agenda.
				</p>
				<Link
					href="/dashboard/settings#reservas"
					className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-white px-5 font-semibold text-[15px] text-chapter-violet outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-chapter-violet"
				>
					Configurar reservas
				</Link>
			</m.section>
		);
	}

	const { context } = next;
	const ActionIcon = actionIcons[next.modality];
	const live =
		Date.parse(next.startsAt) <= now && Date.parse(next.endsAt) > now;

	return (
		<m.section
			variants={panelIn}
			aria-labelledby="next-title"
			className="flex flex-col rounded-[1.75rem] bg-chapter-violet p-6 text-white xl:col-span-4"
		>
			<p className="text-[14px] text-white/75">
				{live ? "Sesión en curso" : "Tu próxima sesión"}
			</p>
			<h2
				id="next-title"
				className="mt-1 font-display font-medium text-[2rem] leading-[1.05] tracking-[-0.02em]"
			>
				{next.patient}
			</h2>
			<p
				className="mt-1 font-display text-[1.375rem] text-white/85 leading-tight"
				aria-live="polite"
			>
				{countdown(next, today, now)}
			</p>

			<dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-[15px]">
				<div>
					<dt className="text-[13px] text-white/70">Hora</dt>
					<dd className="font-semibold tabular-nums">
						{formatTime(next.time)} · {formatDuration(next.minutes)}
					</dd>
				</div>
				<div>
					<dt className="text-[13px] text-white/70">Modalidad</dt>
					<dd className="font-semibold">
						{modalityLabels[next.modality]}
						{next.from ? `, desde ${next.from}` : ""}
					</dd>
				</div>
				<div>
					<dt className="text-[13px] text-white/70">Estado</dt>
					<dd className="font-semibold">{stateLabels[next.status]}</dd>
				</div>
				<div>
					<dt className="text-[13px] text-white/70">Saldo</dt>
					<dd className="font-semibold tabular-nums">
						{context.owedUsd > 0 ? `Debe ${usd(context.owedUsd)}` : "Al día"}
					</dd>
				</div>
				{next.location ? (
					<div className="col-span-2">
						<dt className="text-[13px] text-white/70">Lugar</dt>
						<dd className="font-semibold">{next.location}</dd>
					</div>
				) : null}
			</dl>

			<div className="mt-6 flex flex-col gap-2 rounded-2xl bg-white/12 p-4 text-[15px] leading-snug">
				<p>
					<span className="block text-[13px] text-white/70">Última nota</span>
					{context.lastNote
						? `${context.lastNote.title || "Sin título"} · ${shortDate(context.lastNote.createdAt, timezone)}${context.lastNote.signed ? "" : " (borrador)"}`
						: "Aún no hay notas de este paciente."}
				</p>
				<p>
					<span className="block text-[13px] text-white/70">Tarea activa</span>
					{context.task
						? `${context.task.title}${context.task.lastMood !== null ? ` · ánimo ${context.task.lastMood} de 10` : " · sin respuestas"}`
						: "Sin tareas asignadas."}
				</p>
			</div>

			{next.modality === "video" ? (
				<div className="mt-6 flex flex-wrap items-center gap-2 xl:mt-auto xl:pt-6">
					<JoinSessionLink
						appointmentId={next.id}
						className="h-12 flex-1 bg-white px-5 text-[15px] text-chapter-violet hover:-translate-y-0.5 focus-visible:ring-white focus-visible:ring-offset-chapter-violet"
					/>
					<CopyPatientLink
						appointmentId={next.id}
						label="Enlace del paciente"
						className="h-12 px-4 text-[15px] text-white hover:bg-white/12 focus-visible:ring-white"
					/>
					<Link
						href={`/dashboard/patients/${next.patientId}`}
						className="inline-flex h-12 items-center justify-center rounded-full px-4 font-semibold text-[15px] text-white outline-none transition-colors hover:bg-white/12 focus-visible:ring-2 focus-visible:ring-white"
					>
						Ver ficha
					</Link>
				</div>
			) : (
				<div className="mt-6 flex flex-wrap items-center gap-2 xl:mt-auto xl:pt-6">
					<Link
						href={`/dashboard/patients/${next.patientId}`}
						className="inline-flex h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-5 font-semibold text-[15px] text-chapter-violet outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-chapter-violet active:translate-y-0 active:scale-[0.97]"
					>
						<ActionIcon aria-hidden="true" className="size-4" />
						Ver ficha del paciente
					</Link>
					<Link
						href={`/dashboard/notes?new=${next.patientId}&session=${next.id}`}
						className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-4 font-semibold text-[15px] text-white outline-none transition-colors hover:bg-white/12 focus-visible:ring-2 focus-visible:ring-white"
					>
						<FileText aria-hidden="true" className="size-4" />
						Nueva nota
					</Link>
				</div>
			)}
		</m.section>
	);
}
