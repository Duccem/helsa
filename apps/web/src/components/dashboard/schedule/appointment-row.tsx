"use client";

import { cn } from "@helsa/ui/lib/utils";
import { Repeat } from "lucide-react";

import type { ScheduleEntry } from "@/lib/core/appointment/use-cases/load-schedule";

import { PatientAvatar } from "../therapist/parts";
import {
	displayState,
	formatClock,
	formatDuration,
	modalityIcons,
	modalityLabels,
	stateLabels,
	stateStyles,
	type TimeFormat,
} from "./format";

export function AppointmentRow({
	entry,
	now,
	timeFormat,
}: {
	entry: ScheduleEntry;
	now: number;
	timeFormat: TimeFormat;
}) {
	const state = displayState(entry, now);
	const Icon = modalityIcons[entry.modality];
	const faded =
		state === "completed" || state === "cancelled" || state === "no_show";
	const where =
		entry.modality === "in_person" && entry.location
			? entry.location
			: modalityLabels[entry.modality];

	return (
		<li
			className={cn(
				"grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-2xl px-3 py-3 transition-colors sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:px-4",
				state === "live" ? "bg-chapter-lilac" : "hover:bg-dash-ground",
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
					{formatClock(entry.time, timeFormat)}
				</p>
				<p className="text-[13px] text-muted-foreground">
					{formatDuration(entry.minutes)}
				</p>
			</div>
			<div className="flex min-w-0 items-center gap-3">
				<PatientAvatar name={entry.patient.name} />
				<div className="min-w-0">
					<p className="truncate font-semibold text-[15px]">
						{entry.patient.name}
					</p>
					<p className="flex items-center gap-1.5 truncate text-[14px] text-muted-foreground">
						<Icon aria-hidden="true" className="size-3.5 shrink-0" />
						<span className="truncate">{where}</span>
						{entry.recurring ? (
							<>
								<Repeat aria-hidden="true" className="ml-1 size-3.5 shrink-0" />
								<span className="sr-only">, </span>
								<span className="truncate">Recurrente</span>
							</>
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
		</li>
	);
}
