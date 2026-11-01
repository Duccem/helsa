"use client";

import { cn } from "@helsa/ui/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import type { ScheduleEntry } from "@/lib/core/appointment/use-cases/load-schedule";

import { dayShort } from "../therapist/clinic-time";
import { Panel, PanelHeading } from "../therapist/parts";
import {
	countLabel,
	formatClock,
	longDay,
	monthGrid,
	monthTitle,
	shiftMonth,
	type TimeFormat,
	type WeekStart,
	weekOrder,
} from "./format";

const navButton =
	"inline-flex size-10 items-center justify-center rounded-full bg-dash-ground outline-none transition-[background-color,transform] duration-200 hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring active:scale-95";

function monthHref(month: string) {
	return { pathname: "/dashboard/schedule", query: { month } } as const;
}

export function MonthCalendar({
	month,
	today,
	weekStartsOn,
	timeFormat,
	byDay,
	selected,
	onSelect,
}: {
	month: string;
	today: string;
	weekStartsOn: WeekStart;
	timeFormat: TimeFormat;
	byDay: Map<string, ScheduleEntry[]>;
	selected: string;
	onSelect: (day: string) => void;
}) {
	const grid = monthGrid(month, weekStartsOn);
	const currentMonth = today.slice(0, 7);

	return (
		<Panel aria-labelledby="calendar-title" className="xl:col-span-7">
			<PanelHeading id="calendar-title" title={monthTitle(month)}>
				<div className="flex items-center gap-2">
					{month !== currentMonth ? (
						<Link
							href={monthHref(currentMonth)}
							scroll={false}
							className="inline-flex h-10 items-center rounded-full px-4 font-semibold text-[14px] text-dash-link outline-none transition-colors hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring"
						>
							Hoy
						</Link>
					) : null}
					<Link
						href={monthHref(shiftMonth(month, -1))}
						scroll={false}
						aria-label="Mes anterior"
						className={navButton}
					>
						<ChevronLeft aria-hidden="true" className="size-5" />
					</Link>
					<Link
						href={monthHref(shiftMonth(month, 1))}
						scroll={false}
						aria-label="Mes siguiente"
						className={navButton}
					>
						<ChevronRight aria-hidden="true" className="size-5" />
					</Link>
				</div>
			</PanelHeading>

			<div className="-mx-1 mt-5 grid grid-cols-7 gap-1">
				{weekOrder(weekStartsOn).map((weekday) => (
					<p
						key={weekday}
						aria-hidden="true"
						className="pb-1 text-center text-[13px] text-muted-foreground"
					>
						{dayShort[weekday]}
					</p>
				))}

				{grid.map((cell) => {
					const entries = (byDay.get(cell.iso) ?? []).filter(
						(entry) => entry.status !== "cancelled",
					);
					const isSelected = cell.iso === selected;
					const isToday = cell.iso === today;
					const isPast = cell.iso < today;
					const shown = entries.slice(0, 2);
					const rest = entries.length - shown.length;

					return (
						<button
							key={cell.iso}
							type="button"
							onClick={() => onSelect(cell.iso)}
							aria-pressed={isSelected}
							aria-label={`${longDay(cell.iso)}${isToday ? ", hoy" : ""}, ${countLabel(entries.length)}`}
							className={cn(
								"flex min-h-[4.25rem] flex-col items-center gap-1 rounded-2xl p-1.5 text-left outline-none transition-[background-color,box-shadow,transform] duration-200 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] sm:min-h-[6.5rem] sm:items-stretch sm:p-2",
								isSelected
									? "bg-chapter-lilac ring-2 ring-chapter-violet/60 dark:ring-primary/60"
									: "hover:bg-dash-ground",
								!cell.inMonth && "opacity-45",
							)}
						>
							<span
								className={cn(
									"inline-flex size-8 shrink-0 items-center justify-center rounded-full font-display font-medium text-[15px] tabular-nums",
									isToday && "bg-chapter-violet text-white",
									!isToday && isPast && "text-muted-foreground",
								)}
							>
								{cell.day}
							</span>

							{/* Phones: one dot per appointment. */}
							<span aria-hidden="true" className="flex gap-1 sm:hidden">
								{entries.slice(0, 3).map((entry) => (
									<span
										key={entry.id}
										className="size-1.5 rounded-full bg-chapter-violet/60 dark:bg-primary/70"
									/>
								))}
							</span>

							{/* Larger screens: the first appointments by name. */}
							<span
								aria-hidden="true"
								className="hidden flex-col gap-1 sm:flex"
							>
								{shown.map((entry) => (
									<span
										key={entry.id}
										className={cn(
											"truncate rounded-md px-1.5 py-0.5 text-[12px] leading-tight",
											entry.status === "confirmed"
												? "bg-chapter-teal"
												: "bg-card",
										)}
									>
										<span className="font-semibold tabular-nums">
											{formatClock(entry.time, timeFormat)}
										</span>{" "}
										{entry.patient.name.split(" ")[0]}
									</span>
								))}
								{rest > 0 ? (
									<span className="px-1.5 text-[12px] text-muted-foreground">
										+{rest} más
									</span>
								) : null}
							</span>
						</button>
					);
				})}
			</div>
		</Panel>
	);
}
