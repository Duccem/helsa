"use client";

import { cn } from "@helsa/ui/lib/utils";
import { CalendarCheck } from "lucide-react";
import { m } from "motion/react";
import { useEffect, useMemo, useState } from "react";

import type {
	ScheduleData,
	ScheduleEntry,
} from "@/lib/core/appointment/use-cases/load-schedule";

import { itemIn, Panel, PanelHeading, stagger } from "../therapist/parts";
import { AppointmentRow } from "./appointment-row";
import {
	countLabel,
	formatClock,
	groupByDay,
	longDay,
	relativeDay,
	type TimeFormat,
} from "./format";
import { MonthCalendar } from "./month-calendar";

/** Starts from the server's clock, then follows the real one every 30 s. */
function useNow(initialIso: string) {
	const [now, setNow] = useState(() => Date.parse(initialIso));
	useEffect(() => {
		setNow(Date.now());
		const id = window.setInterval(() => setNow(Date.now()), 30_000);
		return () => window.clearInterval(id);
	}, []);
	return now;
}

function initialDay({ month, today, appointments }: ScheduleData) {
	if (today.startsWith(month)) return today;
	return (
		appointments.find((entry) => entry.day.startsWith(month))?.day ??
		`${month}-01`
	);
}

function todaySummary(
	upcoming: ScheduleEntry[],
	today: string,
	now: number,
	timeFormat: TimeFormat,
) {
	const left = upcoming.filter(
		(entry) => entry.day === today && Date.parse(entry.endsAt) > now,
	);
	if (left.length === 0) return "Hoy no te quedan citas.";
	const count =
		left.length === 1 ? "te queda 1 cita" : `te quedan ${left.length} citas`;
	const next = left[0];
	return next
		? `Hoy ${count}; la próxima a las ${formatClock(next.time, timeFormat)}.`
		: `Hoy ${count}.`;
}

const filters = [
	{ id: "all", label: "Todas" },
	{ id: "scheduled", label: "Por confirmar" },
	{ id: "confirmed", label: "Confirmadas" },
] as const;

type Filter = (typeof filters)[number]["id"];

function EmptyNote({ children }: { children: React.ReactNode }) {
	return (
		<p className="mt-3 rounded-2xl bg-dash-ground px-5 py-8 text-[16px]">
			{children}
		</p>
	);
}

export function SchedulePage({ schedule }: { schedule: ScheduleData }) {
	const { today, timeFormat, upcoming } = schedule;
	const now = useNow(schedule.nowIso);
	const [selected, setSelected] = useState(() => initialDay(schedule));
	const [filter, setFilter] = useState<Filter>("all");

	const byDay = useMemo(
		() => groupByDay(schedule.appointments),
		[schedule.appointments],
	);
	const dayEntries = byDay.get(selected) ?? [];
	const dayActive = dayEntries.filter((entry) => entry.status !== "cancelled");

	const unconfirmed = upcoming.filter(
		(entry) => entry.status === "scheduled",
	).length;
	const filtered =
		filter === "all"
			? upcoming
			: upcoming.filter((entry) => entry.status === filter);
	const upcomingByDay = [...groupByDay(filtered)];

	return (
		<m.div
			initial="hidden"
			animate="show"
			variants={stagger(0.08)}
			className="mx-auto max-w-[96rem]"
		>
			<m.header variants={itemIn} className="pt-2 pb-8">
				<h1 className="font-display font-medium text-[clamp(2.25rem,4vw,3.5rem)] leading-[1] tracking-[-0.03em]">
					Agenda
				</h1>
				<p className="mt-3 text-[17px] leading-relaxed">
					{longDay(today)}. {todaySummary(upcoming, today, now, timeFormat)}
					{unconfirmed > 0
						? ` ${unconfirmed === 1 ? "1 cita está" : `${unconfirmed} citas están`} por confirmar.`
						: ""}
				</p>
			</m.header>

			<div className="grid gap-4 xl:grid-cols-12">
				<MonthCalendar
					month={schedule.month}
					today={today}
					weekStartsOn={schedule.weekStartsOn}
					timeFormat={timeFormat}
					byDay={byDay}
					selected={selected}
					onSelect={setSelected}
				/>

				<Panel aria-labelledby="day-title" className="xl:col-span-5">
					<PanelHeading id="day-title" title={relativeDay(selected, today)}>
						<p className="text-[15px] text-muted-foreground">
							{relativeDay(selected, today) !== longDay(selected)
								? `${longDay(selected)} · `
								: ""}
							{countLabel(dayActive.length)}
						</p>
					</PanelHeading>
					<div aria-live="polite">
						{dayEntries.length === 0 ? (
							<EmptyNote>No tienes citas este día.</EmptyNote>
						) : (
							<ul className="mt-4 flex flex-col gap-1">
								{dayEntries.map((entry) => (
									<AppointmentRow
										key={entry.id}
										entry={entry}
										now={now}
										timeFormat={timeFormat}
									/>
								))}
							</ul>
						)}
					</div>
				</Panel>

				<Panel aria-labelledby="upcoming-title" className="xl:col-span-12">
					<PanelHeading id="upcoming-title" title="Próximas citas">
						<fieldset
							aria-label="Filtrar citas"
							className="m-0 flex min-w-0 flex-wrap gap-1 rounded-full border-0 bg-dash-ground p-1"
						>
							{filters.map((option) => {
								const count =
									option.id === "all"
										? upcoming.length
										: upcoming.filter((entry) => entry.status === option.id)
												.length;
								const active = filter === option.id;
								return (
									<button
										key={option.id}
										type="button"
										aria-pressed={active}
										onClick={() => setFilter(option.id)}
										className={cn(
											"inline-flex h-9 items-center gap-2 rounded-full px-4 font-semibold text-[14px] outline-none transition-[background-color,color] duration-200 focus-visible:ring-2 focus-visible:ring-ring",
											active
												? "bg-card text-foreground shadow-xs"
												: "text-muted-foreground hover:text-foreground",
										)}
									>
										{option.label}
										<span className="text-muted-foreground tabular-nums">
											{count}
										</span>
									</button>
								);
							})}
						</fieldset>
					</PanelHeading>

					{upcoming.length === 0 ? (
						<div className="mt-4 flex flex-col items-start gap-3 rounded-2xl bg-dash-ground px-5 py-8">
							<CalendarCheck
								aria-hidden="true"
								className="size-6 text-chapter-violet dark:text-primary"
							/>
							<p className="max-w-[48ch] text-[16px]">
								No tienes citas próximas. Comparte tu enlace de reservas para
								que tus pacientes elijan su hora.
							</p>
						</div>
					) : filtered.length === 0 ? (
						<EmptyNote>No hay citas con este estado.</EmptyNote>
					) : (
						<div className="mt-4 flex flex-col gap-5">
							{upcomingByDay.map(([day, entries]) => (
								<section key={day} aria-label={longDay(day)}>
									<h3 className="px-1 font-semibold text-[16px]">
										{relativeDay(day, today)}
										<span className="font-normal text-muted-foreground">
											{relativeDay(day, today) !== longDay(day)
												? ` · ${longDay(day)}`
												: ""}
											{" · "}
											{countLabel(entries.length)}
										</span>
									</h3>
									<ul className="mt-1 flex flex-col gap-1">
										{entries.map((entry) => (
											<AppointmentRow
												key={entry.id}
												entry={entry}
												now={now}
												timeFormat={timeFormat}
											/>
										))}
									</ul>
								</section>
							))}
							{upcoming.length >= schedule.upcomingLimit ? (
								<p className="px-1 text-[14px] text-muted-foreground">
									Mostrando las próximas {schedule.upcomingLimit} citas. Usa el
									calendario para ver más adelante.
								</p>
							) : null}
						</div>
					)}
				</Panel>
			</div>
		</m.div>
	);
}
