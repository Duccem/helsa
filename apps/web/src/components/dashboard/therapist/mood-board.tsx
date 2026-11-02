"use client";

import { cn } from "@helsa/ui/lib/utils";
import { m } from "motion/react";

import Link from "next/link";

import type {
	HomeMood,
	TherapistHome,
} from "@/lib/core/therapist/use-cases/load-therapist-home";

import { dayNames, dayShort } from "./clinic-time";
import {
	EASE_OUT,
	itemIn,
	Panel,
	PanelHeading,
	PanelLink,
	PatientAvatar,
	stagger,
} from "./parts";

function average(values: number[]) {
	return (
		values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length)
	);
}

function trend(scores: HomeMood["scores"]) {
	const answered = scores.filter((score): score is number => score !== null);
	if (answered.length < 2)
		return { label: "Pocas respuestas", tone: "text-muted-foreground" };
	const change = average(answered.slice(-3)) - average(answered.slice(0, 3));
	if (change >= 1) return { label: "Subiendo", tone: "text-dash-good" };
	if (change <= -1) return { label: "Bajando", tone: "text-dash-alert" };
	return { label: "Estable", tone: "text-muted-foreground" };
}

function barColor(score: number) {
	if (score <= 3) return "bg-destructive/75";
	if (score <= 6) return "bg-chapter-violet/45 dark:bg-primary/55";
	return "bg-chapter-violet dark:bg-primary";
}

function weekdayOf(day: string) {
	return (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7;
}

export function MoodBoard({
	moods,
	today,
}: {
	moods: TherapistHome["moods"];
	today: string;
}) {
	// The last seven days, ending today.
	const days = Array.from({ length: 7 }, (_, index) => {
		const date = new Date(`${today}T00:00:00Z`);
		date.setUTCDate(date.getUTCDate() - 6 + index);
		const iso = date.toISOString().slice(0, 10);
		return { iso, weekday: weekdayOf(iso), offset: index - 6 };
	});

	return (
		<Panel aria-labelledby="mood-title" className="xl:col-span-7">
			<PanelHeading id="mood-title" title="Cómo se sienten">
				<PanelLink href="/dashboard/tasks" className="-mr-3">
					Ver tareas
				</PanelLink>
			</PanelHeading>
			<p className="mt-1 max-w-[52ch] text-[15px] text-muted-foreground">
				Ánimo del 1 al 10 que tus pacientes marcan al responder sus tareas,
				últimos siete días.
			</p>

			{moods.length === 0 ? (
				<p className="mt-5 rounded-2xl bg-dash-ground px-5 py-8 text-[16px]">
					Nadie ha marcado su ánimo esta semana. Asigna una tarea que pida el
					ánimo para seguirlo aquí.
				</p>
			) : null}

			<m.ul variants={stagger(0.06, 0.2)} className="mt-5 flex flex-col gap-1">
				{moods.map((track) => {
					const last =
						[...track.scores].reverse().find((score) => score !== null) ?? null;
					const direction = trend(track.scores);
					return (
						<m.li key={track.taskId} variants={itemIn}>
							<Link
								href={`/dashboard/tasks?task=${track.taskId}`}
								className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 rounded-2xl px-3 py-3 outline-none transition-colors hover:bg-dash-ground focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[minmax(0,1.1fr)_minmax(9rem,1fr)_4.5rem]"
							>
								<div className="flex min-w-0 items-center gap-3">
									<PatientAvatar name={track.patient} />
									<div className="min-w-0">
										<p className="flex items-center gap-2 truncate font-semibold text-[15px]">
											{track.patient}
											{track.unseen ? (
												<span className="rounded-full bg-chapter-lilac px-2 py-0.5 font-semibold text-[13px] text-chapter-violet dark:text-foreground">
													Nueva
												</span>
											) : null}
										</p>
										<p className="truncate text-[14px] text-muted-foreground">
											{track.task}
										</p>
									</div>
								</div>

								<div
									role="img"
									aria-label={`Ánimo de ${track.patient}: ${track.scores
										.map(
											(score, index) =>
												`${dayNames[days[index]?.weekday ?? 0]} ${score ?? "sin respuesta"}`,
										)
										.join(", ")}`}
									className="col-span-2 row-start-2 flex h-14 items-end gap-1.5 sm:col-span-1 sm:row-start-auto"
								>
									{track.scores.map((score, index) => (
										<div
											key={days[index]?.offset ?? index}
											className="flex h-full flex-1 justify-center"
										>
											{/* The track is the full 10; an empty track is a day without an answer. */}
											<span className="relative h-full w-full max-w-5 overflow-hidden rounded-full bg-dash-ground">
												{score === null ? null : (
													<m.span
														variants={{
															hidden: { scaleY: 0 },
															show: {
																scaleY: 1,
																transition: {
																	duration: 0.6,
																	ease: EASE_OUT,
																	delay: 0.2 + index * 0.04,
																},
															},
														}}
														style={{
															height: `${score * 10}%`,
															transformOrigin: "50% 100%",
														}}
														className={cn(
															"absolute inset-x-0 bottom-0 rounded-full",
															barColor(score),
														)}
													/>
												)}
											</span>
										</div>
									))}
								</div>

								<div className="col-start-2 row-start-1 text-right sm:col-start-auto sm:row-start-auto">
									<p className="font-display font-medium text-2xl tabular-nums leading-none">
										{last ?? "–"}
										<span className="font-landing text-[13px] text-muted-foreground">
											/10
										</span>
									</p>
									<p
										className={cn(
											"mt-1 font-semibold text-[13px]",
											direction.tone,
										)}
									>
										{direction.label}
									</p>
								</div>
							</Link>
						</m.li>
					);
				})}
			</m.ul>

			{moods.length > 0 ? (
				<div
					aria-hidden="true"
					className="mt-1 hidden grid-cols-[minmax(0,1.1fr)_minmax(9rem,1fr)_4.5rem] gap-x-4 px-3 sm:grid"
				>
					<span />
					<div className="flex gap-1.5">
						{days.map((day) => (
							<span
								key={day.offset}
								className="flex-1 text-center text-[13px] text-muted-foreground"
							>
								{day.offset === 0 ? "Hoy" : dayShort[day.weekday]}
							</span>
						))}
					</div>
					<span />
				</div>
			) : null}
		</Panel>
	);
}
