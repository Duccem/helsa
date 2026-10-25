"use client";

import { FileText, MapPin, Phone, Video } from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";

import { dayNames, formatDuration, formatTime } from "./clinic-time";
import {
	contextFor,
	modalityLabels,
	stateLabels,
	type Upcoming,
} from "./mock-data";
import { panelIn } from "./parts";

function countdown(upcoming: Upcoming) {
	const { live, startsIn, offset, weekday, session } = upcoming;
	if (live) return "está en sesión ahora";
	if (offset === 0 && startsIn < 60)
		return `empieza en ${Math.max(1, startsIn)} min`;
	if (offset === 0) {
		const hours = Math.floor(startsIn / 60);
		const minutes = startsIn % 60;
		return `empieza en ${hours} h${minutes ? ` ${minutes} min` : ""}`;
	}
	if (offset === 1) return `mañana a las ${formatTime(session.time)}`;
	return `el ${dayNames[weekday].toLowerCase()} a las ${formatTime(session.time)}`;
}

const actionIcons = { video: Video, in_person: MapPin, phone: Phone } as const;
const actionLabels = {
	video: "Entrar a la videoconsulta",
	in_person: "Ver ficha de la sesión",
	phone: "Llamar al paciente",
} as const;

export function NextSession({ upcoming }: { upcoming: Upcoming | null }) {
	if (!upcoming) {
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
					Semana sin sesiones
				</h2>
				<p className="mt-3 text-[16px] text-white/85">
					Comparte tu enlace de reservas para llenar tu agenda.
				</p>
			</m.section>
		);
	}

	const { session, live } = upcoming;
	const context = contextFor(session.patient);
	const ActionIcon = actionIcons[session.modality];
	const soon = live || (upcoming.offset === 0 && upcoming.startsIn <= 15);

	return (
		<m.section
			variants={panelIn}
			aria-labelledby="next-title"
			className="flex flex-col rounded-[1.75rem] bg-chapter-violet p-6 text-white xl:col-span-4"
		>
			<h2
				id="next-title"
				className="font-display font-medium text-[2rem] leading-[1.05] tracking-[-0.02em]"
			>
				{session.patient}
			</h2>
			<p
				className="mt-1 font-display text-[1.375rem] text-white/85 leading-tight"
				aria-live="polite"
			>
				{countdown(upcoming)}
			</p>

			<dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-[15px]">
				<div>
					<dt className="text-[13px] text-white/70">Hora</dt>
					<dd className="font-semibold tabular-nums">
						{formatTime(session.time)} · {formatDuration(session.minutes)}
					</dd>
				</div>
				<div>
					<dt className="text-[13px] text-white/70">Modalidad</dt>
					<dd className="font-semibold">
						{modalityLabels[session.modality]}
						{session.from ? `, ${session.from}` : ""}
					</dd>
				</div>
				<div className="col-span-2">
					<dt className="text-[13px] text-white/70">Recordatorio</dt>
					<dd className="font-semibold">{stateLabels[session.reminder]}</dd>
				</div>
			</dl>

			<div className="mt-6 rounded-2xl bg-white/12 p-4 text-[15px] leading-snug">
				<p className="font-semibold">{context.focus}</p>
				<p className="mt-2 text-white/85">{context.lastNote}</p>
				<p className="mt-2 text-white/85">{context.task}</p>
			</div>

			<div className="mt-6 flex flex-wrap items-center gap-2 xl:mt-auto xl:pt-6">
				<Link
					href="/dashboard/schedule"
					className="inline-flex h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-5 font-semibold text-[15px] text-chapter-violet outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-chapter-violet active:translate-y-0 active:scale-[0.97]"
				>
					<ActionIcon aria-hidden="true" className="size-4" />
					{actionLabels[session.modality]}
					{soon && session.modality === "video" ? (
						<span aria-hidden="true" className="relative ml-1 flex size-2">
							<span className="absolute inset-0 animate-ping rounded-full bg-chapter-violet/60 motion-reduce:animate-none" />
							<span className="relative size-2 rounded-full bg-chapter-violet" />
						</span>
					) : null}
				</Link>
				<Link
					href="/dashboard/notes"
					className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-4 font-semibold text-[15px] text-white outline-none transition-colors hover:bg-white/12 focus-visible:ring-2 focus-visible:ring-white"
				>
					<FileText aria-hidden="true" className="size-4" />
					Expediente
				</Link>
			</div>
		</m.section>
	);
}
