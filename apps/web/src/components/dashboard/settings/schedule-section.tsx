"use client";

import { cn } from "@helsa/ui/lib/utils";
import { CopyCheck, Plus, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useRef } from "react";

import { ProfileSection } from "../profile/parts";
import { dayNames, dayShort, formatDuration } from "../therapist/clinic-time";
import { EASE_OUT } from "../therapist/parts";
import {
	Field,
	FieldError,
	NumberInput,
	SaveBar,
	SelectInput,
	Toggle,
	useSectionForm,
} from "./fields";
import {
	type AvailabilityRange,
	minutesOf,
	type ScheduleInput,
	scheduleSchema,
	sessionsThatFit,
	timezones,
} from "./schema";

/** Monday-first indexes, rotated when the week starts on Sunday. */
export function weekOrder(weekStartsOn: 0 | 6) {
	return weekStartsOn === 6 ? [6, 0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6];
}

export function weeklyTotals(schedule: ScheduleInput) {
	let minutes = 0;
	let sessions = 0;
	for (const range of schedule.ranges) {
		const length = minutesOf(range.end) - minutesOf(range.start);
		if (length > 0) minutes += length;
		sessions += sessionsThatFit(
			range,
			schedule.sessionMinutes,
			schedule.bufferMinutes,
		);
	}
	return { minutes, sessions };
}

function hoursLabel(minutes: number) {
	const hours = minutes / 60;
	return Number.isInteger(hours)
		? `${hours} h`
		: `${hours.toLocaleString("es", { maximumFractionDigits: 1 })} h`;
}

const validTime = (time: string) => /^\d{2}:\d{2}$/.test(time);

/**
 * The week as seven columns of the working day. Filled where the therapist
 * takes sessions; each column says how many fit.
 */
function WeekBoard({
	ranges,
	order,
	sessionMinutes,
	bufferMinutes,
	onPickDay,
}: {
	ranges: AvailabilityRange[];
	order: number[];
	sessionMinutes: number;
	bufferMinutes: number;
	onPickDay: (weekday: number) => void;
}) {
	const valid = ranges.filter(
		(range) =>
			validTime(range.start) &&
			validTime(range.end) &&
			minutesOf(range.end) > minutesOf(range.start),
	);
	// The board always shows 7:00–21:00 and grows to fit earlier or later hours.
	const from = Math.min(
		7 * 60,
		...valid.map((range) => minutesOf(range.start)),
	);
	const to = Math.max(21 * 60, ...valid.map((range) => minutesOf(range.end)));
	const span = to - from;
	const marks = [from, from + span / 2, to].map((minutes) => {
		const hour = Math.round(minutes / 60);
		return `${hour}:00`;
	});

	return (
		<div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
			<div
				aria-hidden="true"
				className="flex flex-col justify-between pt-8 pb-8 text-right text-[13px] text-foreground/65 tabular-nums"
			>
				{marks.map((mark) => (
					<span key={mark}>{mark}</span>
				))}
			</div>
			<ol className="grid grid-cols-7 gap-1.5 sm:gap-2" aria-label="Tu semana">
				{order.map((weekday) => {
					const day = valid.filter((range) => range.weekday === weekday);
					const count = day.reduce(
						(total, range) =>
							total + sessionsThatFit(range, sessionMinutes, bufferMinutes),
						0,
					);
					const label =
						day.length === 0
							? `${dayNames[weekday]}: cerrado`
							: `${dayNames[weekday]}: ${day
									.map((range) => `${range.start} a ${range.end}`)
									.join(
										" y ",
									)}, ${count} ${count === 1 ? "sesión" : "sesiones"}`;
					return (
						<li key={weekday} className="min-w-0">
							<button
								type="button"
								onClick={() => onPickDay(weekday)}
								aria-label={`${label}. Editar este día`}
								className="group flex w-full flex-col items-center gap-2 rounded-[1rem] outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								<span className="font-semibold text-[14px]">
									{dayShort[weekday]}
								</span>
								<span className="relative block h-44 w-full overflow-hidden rounded-[0.875rem] bg-dash-ground transition-colors group-hover:bg-chapter-lilac sm:h-56">
									<AnimatePresence initial={false}>
										{day.map((range) => {
											const top =
												((minutesOf(range.start) - from) / span) * 100;
											const height =
												((minutesOf(range.end) - minutesOf(range.start)) /
													span) *
												100;
											return (
												<m.span
													key={`${range.start}-${range.end}`}
													initial={{ opacity: 0, scaleY: 0.6 }}
													animate={{
														opacity: 1,
														scaleY: 1,
														top: `${top}%`,
														height: `${height}%`,
													}}
													exit={{ opacity: 0, scaleY: 0.6 }}
													transition={{ duration: 0.4, ease: EASE_OUT }}
													className="absolute inset-x-1 origin-top rounded-[0.625rem] bg-chapter-violet"
												/>
											);
										})}
									</AnimatePresence>
								</span>
								<span
									className={cn(
										"text-[13px] tabular-nums leading-none",
										count > 0 ? "font-semibold" : "text-foreground/60",
									)}
								>
									{count > 0 ? count : "—"}
								</span>
							</button>
						</li>
					);
				})}
			</ol>
		</div>
	);
}

function TimeInput({
	id,
	value,
	onChange,
	label,
	invalid,
}: {
	id: string;
	value: string;
	onChange: (value: string) => void;
	label: string;
	invalid?: boolean;
}) {
	return (
		<input
			id={id}
			type="time"
			step={900}
			value={value}
			onChange={(event) => onChange(event.target.value)}
			aria-label={label}
			aria-invalid={invalid || undefined}
			className="h-11 w-[7.5rem] rounded-full bg-card px-4 text-[15px] text-foreground tabular-nums outline-none transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-ring aria-invalid:ring-2 aria-invalid:ring-destructive/50"
		/>
	);
}

export function ScheduleSection({
	initial,
	weekStartsOn,
}: {
	initial: ScheduleInput;
	weekStartsOn: 0 | 6;
}) {
	const form = useSectionForm({
		section: "schedule",
		schema: scheduleSchema,
		initial,
		success: "Guardamos tu horario.",
	});
	const { value, update, errors } = form;
	const order = weekOrder(weekStartsOn);
	const closedDays = useRef(new Map<number, AvailabilityRange[]>());
	const totals = weeklyTotals(value);

	const timezoneOptions = timezones.some(([zone]) => zone === value.timezone)
		? timezones
		: ([[value.timezone, value.timezone], ...timezones] as const);

	function setRanges(ranges: AvailabilityRange[]) {
		update({ ranges });
	}

	function patchRange(index: number, patch: Partial<AvailabilityRange>) {
		setRanges(
			value.ranges.map((range, position) =>
				position === index ? { ...range, ...patch } : range,
			),
		);
	}

	function toggleDay(weekday: number, open: boolean) {
		if (open) {
			const remembered = closedDays.current.get(weekday);
			setRanges([
				...value.ranges,
				...(remembered ?? [{ weekday, start: "09:00", end: "17:00" }]),
			]);
		} else {
			closedDays.current.set(
				weekday,
				value.ranges.filter((range) => range.weekday === weekday),
			);
			setRanges(value.ranges.filter((range) => range.weekday !== weekday));
		}
	}

	function addRange(weekday: number) {
		const day = value.ranges
			.filter((range) => range.weekday === weekday)
			.sort((a, b) => minutesOf(a.end) - minutesOf(b.end));
		const last = day.at(-1);
		const start = last ? Math.min(minutesOf(last.end) + 60, 22 * 60) : 9 * 60;
		const end = Math.min(start + 4 * 60, 23 * 60 + 45);
		const clock = (minutes: number) =>
			`${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
		setRanges([
			...value.ranges,
			{ weekday, start: clock(start), end: clock(end) },
		]);
	}

	function copyToWeekdays(weekday: number) {
		const source = value.ranges.filter((range) => range.weekday === weekday);
		const targets = [0, 1, 2, 3, 4].filter((day) => day !== weekday);
		setRanges([
			...value.ranges.filter((range) => !targets.includes(range.weekday)),
			...targets.flatMap((day) =>
				source.map((range) => ({ ...range, weekday: day })),
			),
		]);
	}

	function focusDay(weekday: number) {
		const row = document.getElementById(`dia-${weekday}`);
		row?.scrollIntoView({ behavior: "smooth", block: "center" });
		row
			?.querySelector<HTMLElement>("input, button")
			?.focus({ preventScroll: true });
	}

	return (
		<ProfileSection
			id="horario"
			title="Horario semanal"
			description="Las horas en que atiendes. Tu enlace de reservas solo ofrece horas dentro de estas franjas."
		>
			<form noValidate onSubmit={form.submit} className="grid gap-6">
				<div className="rounded-[1.5rem] bg-card">
					<p
						className="font-display font-medium text-[clamp(1.75rem,2.6vw,2.25rem)] leading-[1.05] tracking-[-0.02em]"
						aria-live="polite"
					>
						{totals.minutes > 0
							? `${hoursLabel(totals.minutes)} a la semana, caben ${totals.sessions} ${totals.sessions === 1 ? "sesión" : "sesiones"}`
							: "Todavía no tienes horas abiertas"}
					</p>
					<p className="mt-2 text-[15px] text-foreground/75">
						Sesiones de {formatDuration(value.sessionMinutes || 0)}
						{value.bufferMinutes > 0
							? ` con ${value.bufferMinutes} min de pausa entre una y otra.`
							: " sin pausa entre una y otra."}
					</p>
				</div>

				<WeekBoard
					ranges={value.ranges}
					order={order}
					sessionMinutes={value.sessionMinutes}
					bufferMinutes={value.bufferMinutes}
					onPickDay={focusDay}
				/>

				<div className="grid gap-5 md:grid-cols-3">
					<Field
						id="schedule-session"
						label="Duración de la sesión"
						error={errors.sessionMinutes}
					>
						<NumberInput
							id="schedule-session"
							value={value.sessionMinutes}
							onValueChange={(sessionMinutes) =>
								update({ sessionMinutes: sessionMinutes ?? Number.NaN })
							}
							min={15}
							max={180}
							step={5}
							unit="min"
						/>
					</Field>
					<Field
						id="schedule-buffer"
						label="Pausa entre sesiones"
						error={errors.bufferMinutes}
					>
						<NumberInput
							id="schedule-buffer"
							value={value.bufferMinutes}
							onValueChange={(bufferMinutes) =>
								update({ bufferMinutes: bufferMinutes ?? Number.NaN })
							}
							min={0}
							max={60}
							step={5}
							unit="min"
						/>
					</Field>
					<Field
						id="schedule-zone"
						label="Zona horaria"
						error={errors.timezone}
					>
						<SelectInput
							id="schedule-zone"
							value={value.timezone}
							onValueChange={(timezone) => update({ timezone })}
							options={timezoneOptions}
						/>
					</Field>
				</div>

				<ul className="grid gap-2">
					{order.map((weekday) => {
						const entries = value.ranges
							.map((range, index) => ({ range, index }))
							.filter(({ range }) => range.weekday === weekday);
						const open = entries.length > 0;
						const count = entries.reduce(
							(total, { range }) =>
								total +
								sessionsThatFit(
									range,
									value.sessionMinutes,
									value.bufferMinutes,
								),
							0,
						);
						return (
							<li
								key={weekday}
								id={`dia-${weekday}`}
								className={cn(
									"scroll-mt-28 rounded-[1.25rem] p-3 transition-colors sm:p-4",
									open ? "bg-dash-ground" : "bg-dash-ground/60",
								)}
							>
								<div className="flex flex-wrap items-start gap-x-4 gap-y-3">
									<div className="flex h-11 w-40 shrink-0 items-center gap-3">
										<Toggle
											checked={open}
											onCheckedChange={(next) => toggleDay(weekday, next)}
											label={`Atender el ${dayNames[weekday].toLowerCase()}`}
										/>
										<span className="font-semibold text-[15px]">
											{dayNames[weekday]}
										</span>
									</div>

									<div className="flex min-w-0 flex-1 flex-col gap-2">
										{open ? (
											<AnimatePresence initial={false}>
												{entries.map(({ range, index }) => (
													<m.div
														key={index}
														initial={{ opacity: 0, y: -6 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ duration: 0.25, ease: EASE_OUT }}
														className="flex flex-col gap-1"
													>
														<div className="flex flex-wrap items-center gap-2">
															<TimeInput
																id={`range-${index}-start`}
																value={range.start}
																onChange={(start) =>
																	patchRange(index, { start })
																}
																label={`${dayNames[weekday]}, desde`}
																invalid={Boolean(
																	errors[`ranges.${index}.start`],
																)}
															/>
															<span className="text-[15px] text-foreground/75">
																a
															</span>
															<TimeInput
																id={`range-${index}-end`}
																value={range.end}
																onChange={(end) => patchRange(index, { end })}
																label={`${dayNames[weekday]}, hasta`}
																invalid={Boolean(errors[`ranges.${index}.end`])}
															/>
															<button
																type="button"
																onClick={() =>
																	setRanges(
																		value.ranges.filter(
																			(_, position) => position !== index,
																		),
																	)
																}
																aria-label={`Quitar la franja de ${range.start} a ${range.end}`}
																className="grid size-10 place-items-center rounded-full text-foreground/70 outline-none transition-[background-color,color,transform] hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
															>
																<X aria-hidden="true" className="size-[18px]" />
															</button>
														</div>
														<FieldError
															message={
																errors[`ranges.${index}.start`] ??
																errors[`ranges.${index}.end`]
															}
														/>
													</m.div>
												))}
											</AnimatePresence>
										) : (
											<p className="flex h-11 items-center text-[15px] text-foreground/70">
												No atiendes este día
											</p>
										)}
									</div>

									{open ? (
										<div className="flex w-full flex-wrap items-center gap-1 sm:w-auto sm:flex-col sm:items-end">
											<p className="mr-auto px-1 text-[14px] tabular-nums sm:mr-0 sm:h-11 sm:leading-[2.75rem]">
												{count} {count === 1 ? "sesión" : "sesiones"}
											</p>
											<div className="flex gap-1">
												<button
													type="button"
													onClick={() => addRange(weekday)}
													className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-semibold text-[14px] text-dash-link outline-none transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring"
												>
													<Plus aria-hidden="true" className="size-4" />
													Franja
												</button>
												{weekday <= 4 ? (
													<button
														type="button"
														onClick={() => copyToWeekdays(weekday)}
														className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-semibold text-[14px] text-dash-link outline-none transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring"
													>
														<CopyCheck aria-hidden="true" className="size-4" />
														Igual de lunes a viernes
													</button>
												) : null}
											</div>
										</div>
									) : null}
								</div>
							</li>
						);
					})}
				</ul>

				<SaveBar
					dirty={form.dirty}
					pending={form.pending}
					onReset={form.reset}
					note={
						form.dirty
							? "Las citas ya agendadas no cambian; solo las horas que se ofrecen."
							: undefined
					}
				/>
			</form>
		</ProfileSection>
	);
}
