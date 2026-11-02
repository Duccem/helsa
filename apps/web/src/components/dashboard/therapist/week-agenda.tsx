"use client";

import { cn } from "@helsa/ui/lib/utils";
import { Repeat } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import { useState } from "react";

import type {
	HomeAppointment,
	TherapistHome,
} from "@/lib/core/therapist/use-cases/load-therapist-home";

import {
	displayState,
	modalityIcons,
	modalityLabels,
	stateLabels,
	stateStyles,
} from "../schedule/format";
import {
	dayNames,
	dayShort,
	formatDuration,
	formatTime,
	monthNames,
} from "./clinic-time";
import {
	EASE_OUT,
	itemIn,
	Panel,
	PanelHeading,
	PanelLink,
	PatientAvatar,
	stagger,
} from "./parts";

function sessionsLabel(count: number) {
	if (count === 0) return "Libre";
	return count === 1 ? "1 sesión" : `${count} sesiones`;
}

function parts(day: string) {
	const [, month = 1, date = 1] = day.split("-").map(Number);
	return { month, date };
}

export function WeekAgenda({
	week,
	today,
	now,
}: {
	week: TherapistHome["week"];
	today: string;
	now: number;
}) {
	const todayIndex = Math.max(0, week.days.indexOf(today));
	const [selected, setSelected] = useState(todayIndex);
	const byDay = (day: string) =>
		week.appointments.filter((item) => item.day === day);
	const day = week.days[selected] ?? week.days[0] ?? today;
	const sessions = byDay(day);
	const first = parts(week.days[0] ?? today);
	const last = parts(week.days[6] ?? today);
	const range =
		first.month === last.month
			? `${first.date} al ${last.date} de ${monthNames[last.month - 1]}`
			: `${first.date} de ${monthNames[first.month - 1]} al ${last.date} de ${monthNames[last.month - 1]}`;

	return (
		<Panel aria-labelledby="agenda-title" className="xl:col-span-8">
			<PanelHeading id="agenda-title" title="Tu semana">
				<p className="text-[15px] text-muted-foreground">{range}</p>
			</PanelHeading>

			<div
				role="tablist"
				aria-label="Días de la semana"
				className="-mx-1 mt-5 grid grid-cols-7 gap-1 sm:gap-2"
			>
				{week.days.map((item, index) => {
					const isSelected = index === selected;
					const isToday = item === today;
					const count = byDay(item).filter(
						(entry) => entry.status !== "cancelled",
					).length;
					const { date } = parts(item);
					return (
						<button
							key={item}
							type="button"
							role="tab"
							aria-selected={isSelected}
							aria-controls="agenda-day"
							aria-label={`${dayNames[index]} ${date}${isToday ? ", hoy" : ""}, ${sessionsLabel(count)}`}
							onClick={() => setSelected(index)}
							className={cn(
								"relative flex flex-col items-center rounded-2xl px-1 py-3 outline-none transition-[background-color,transform] duration-200 focus-visible:ring-2 focus-visible:ring-ring active:scale-95 sm:py-4",
								!isSelected && "hover:bg-dash-ground",
							)}
						>
							{isSelected ? (
								<m.span
									layoutId="agenda-day-indicator"
									transition={{ type: "spring", stiffness: 420, damping: 34 }}
									className="absolute inset-0 rounded-2xl bg-chapter-violet"
								/>
							) : null}
							<span
								className={cn(
									"relative text-[13px] sm:text-[14px]",
									isSelected ? "text-white/85" : "text-muted-foreground",
								)}
							>
								{isToday ? "Hoy" : dayShort[index]}
							</span>
							<span
								className={cn(
									"relative mt-1 font-display font-medium text-xl tabular-nums sm:text-2xl",
									isSelected
										? "text-white"
										: item < today
											? "text-muted-foreground"
											: "",
								)}
							>
								{date}
							</span>
							<span
								aria-hidden="true"
								className="relative mt-2 flex h-1.5 gap-1"
							>
								{Array.from({ length: Math.min(count, 6) }, (_, dot) => (
									<span
										key={dot}
										className={cn(
											"size-1.5 rounded-full",
											isSelected
												? "bg-white/80"
												: "bg-chapter-violet/50 dark:bg-primary/70",
										)}
									/>
								))}
							</span>
						</button>
					);
				})}
			</div>

			<div id="agenda-day" role="tabpanel" aria-live="polite" className="mt-6">
				<AnimatePresence mode="wait" initial={false}>
					<m.div
						key={day}
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.28, ease: EASE_OUT }}
					>
						<div className="flex items-baseline justify-between gap-4 px-1">
							<p className="font-semibold text-[16px]">
								{dayNames[selected]} {parts(day).date}
								<span className="font-normal text-muted-foreground">
									{" · "}
									{sessionsLabel(
										sessions.filter((entry) => entry.status !== "cancelled")
											.length,
									).toLowerCase()}
								</span>
							</p>
							<PanelLink
								href={`/dashboard/schedule?month=${day.slice(0, 7)}`}
								className="-mr-3"
							>
								Abrir agenda
							</PanelLink>
						</div>

						{sessions.length === 0 ? (
							<p className="mt-3 rounded-2xl bg-dash-ground px-5 py-8 text-[16px]">
								{day < today
									? "No tuviste sesiones este día."
									: "Día libre. Tus pacientes pueden reservar desde tu enlace."}
							</p>
						) : (
							<m.ul
								variants={stagger(0.05)}
								initial="hidden"
								animate="show"
								className="mt-2 flex flex-col gap-1"
							>
								{sessions.map((session) => (
									<SessionRow key={session.id} session={session} now={now} />
								))}
							</m.ul>
						)}
					</m.div>
				</AnimatePresence>
			</div>
		</Panel>
	);
}

function SessionRow({
	session,
	now,
}: {
	session: HomeAppointment;
	now: number;
}) {
	const state = displayState(session, now);
	const Icon = modalityIcons[session.modality];
	const live = state === "live";
	const faded =
		state === "completed" || state === "cancelled" || state === "no_show";

	return (
		<m.li variants={itemIn}>
			<Link
				href={`/dashboard/patients/${session.patientId}`}
				className={cn(
					"grid grid-cols-[3.75rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-2xl px-3 py-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:px-4",
					live ? "bg-chapter-lilac" : "hover:bg-dash-ground",
					faded && "opacity-70",
				)}
			>
				<div>
					<p
						className={cn(
							"font-semibold text-[16px] tabular-nums leading-tight",
							state === "cancelled" && "line-through",
						)}
					>
						{formatTime(session.time)}
					</p>
					<p className="text-[13px] text-muted-foreground">
						{formatDuration(session.minutes)}
					</p>
				</div>
				<div className="flex min-w-0 items-center gap-3">
					<PatientAvatar name={session.patient} />
					<div className="min-w-0">
						<p className="truncate font-semibold text-[15px]">
							{session.patient}
						</p>
						<p className="flex items-center gap-1.5 truncate text-[14px] text-muted-foreground">
							<Icon aria-hidden="true" className="size-3.5 shrink-0" />
							<span className="truncate">
								{modalityLabels[session.modality]}
								{session.from ? ` · desde ${session.from}` : ""}
							</span>
							{session.recurring ? (
								<Repeat
									aria-label="Cita recurrente"
									className="size-3.5 shrink-0"
								/>
							) : null}
						</p>
					</div>
				</div>
				<span
					className={cn(
						"col-start-2 inline-flex h-8 items-center justify-self-start rounded-full px-3 font-semibold text-[13px] sm:col-start-3 sm:justify-self-end",
						stateStyles[state],
					)}
				>
					{stateLabels[state]}
				</span>
			</Link>
		</m.li>
	);
}
