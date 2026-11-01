import { MapPin, Phone, Video } from "lucide-react";

import type { ScheduleEntry } from "@/lib/core/appointment/use-cases/load-schedule";

import { dayNames, monthNames } from "../therapist/clinic-time";

export type TimeFormat = "24h" | "12h";
export type WeekStart = 0 | 6;

/** The appointment status, plus what the clock says about active ones. */
export type DisplayState = ScheduleEntry["status"] | "live" | "unclosed";

export const stateLabels: Record<DisplayState, string> = {
	scheduled: "Por confirmar",
	confirmed: "Confirmada",
	completed: "Atendida",
	cancelled: "Cancelada",
	no_show: "No asistió",
	live: "En curso",
	unclosed: "Sin cerrar",
};

export const stateStyles: Record<DisplayState, string> = {
	scheduled: "bg-dash-ground text-foreground",
	confirmed: "bg-chapter-teal text-foreground",
	completed: "bg-transparent text-muted-foreground",
	cancelled: "bg-destructive/12 text-dash-alert",
	no_show: "bg-chapter-peach text-foreground",
	live: "bg-chapter-violet text-white",
	unclosed: "bg-chapter-peach text-foreground",
};

export const modalityLabels: Record<ScheduleEntry["modality"], string> = {
	video: "Videoconsulta",
	in_person: "Presencial",
	phone: "Llamada",
};

export const modalityIcons: Record<ScheduleEntry["modality"], typeof Video> = {
	video: Video,
	in_person: MapPin,
	phone: Phone,
};

export function displayState(entry: ScheduleEntry, now: number): DisplayState {
	if (entry.status !== "scheduled" && entry.status !== "confirmed") {
		return entry.status;
	}
	if (now >= Date.parse(entry.endsAt)) return "unclosed";
	if (now >= Date.parse(entry.startsAt)) return "live";
	return entry.status;
}

/** "09:30" → "9:30" or "9:30 a. m." */
export function formatClock(time: string, format: TimeFormat) {
	const [hours = 0, minutes = 0] = time.split(":").map(Number);
	const mm = String(minutes).padStart(2, "0");
	if (format === "24h") return `${hours}:${mm}`;
	return `${hours % 12 || 12}:${mm} ${hours < 12 ? "a. m." : "p. m."}`;
}

export function formatDuration(minutes: number) {
	if (minutes < 60) return `${minutes} min`;
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

/** Parts of a calendar day ("2026-11-03"). `weekday`: 0 = Monday … 6 = Sunday. */
export function parseDay(iso: string) {
	const [year = 0, month = 1, day = 1] = iso.split("-").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	return { year, month, day, weekday: (date.getUTCDay() + 6) % 7 };
}

export function shiftDay(iso: string, amount: number) {
	const { year, month, day } = parseDay(iso);
	return new Date(Date.UTC(year, month - 1, day + amount))
		.toISOString()
		.slice(0, 10);
}

/** "2026-11" moved by `amount` months. */
export function shiftMonth(month: string, amount: number) {
	const [year = 0, index = 1] = month.split("-").map(Number);
	return new Date(Date.UTC(year, index - 1 + amount, 1))
		.toISOString()
		.slice(0, 7);
}

export function monthTitle(month: string) {
	const [year = 0, index = 1] = month.split("-").map(Number);
	const name = monthNames[index - 1] ?? "";
	return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
}

/** "Martes 3 de noviembre" */
export function longDay(iso: string) {
	const { month, day, weekday } = parseDay(iso);
	return `${dayNames[weekday]} ${day} de ${monthNames[month - 1]}`;
}

/** "Hoy", "Mañana", "Ayer" or the long day. */
export function relativeDay(iso: string, today: string) {
	if (iso === today) return "Hoy";
	if (iso === shiftDay(today, 1)) return "Mañana";
	if (iso === shiftDay(today, -1)) return "Ayer";
	return longDay(iso);
}

export function countLabel(count: number) {
	if (count === 0) return "sin citas";
	return count === 1 ? "1 cita" : `${count} citas`;
}

export function groupByDay(entries: ScheduleEntry[]) {
	const groups = new Map<string, ScheduleEntry[]>();
	for (const entry of entries) {
		const list = groups.get(entry.day);
		if (list) list.push(entry);
		else groups.set(entry.day, [entry]);
	}
	return groups;
}

export type GridDay = {
	iso: string;
	day: number;
	weekday: number;
	inMonth: boolean;
};

/** Whole weeks covering `month`, starting on Monday (0) or Sunday (6). */
export function monthGrid(month: string, weekStartsOn: WeekStart): GridDay[] {
	const [year = 0, index = 1] = month.split("-").map(Number);
	const firstWeekday = parseDay(`${month}-01`).weekday;
	const lead = weekStartsOn === 6 ? (firstWeekday + 1) % 7 : firstWeekday;
	const daysInMonth = new Date(Date.UTC(year, index, 0)).getUTCDate();
	const cells = Math.ceil((lead + daysInMonth) / 7) * 7;

	return Array.from({ length: cells }, (_, cell) => {
		const date = new Date(Date.UTC(year, index - 1, 1 - lead + cell));
		return {
			iso: date.toISOString().slice(0, 10),
			day: date.getUTCDate(),
			weekday: (date.getUTCDay() + 6) % 7,
			inMonth: date.getUTCMonth() === index - 1,
		};
	});
}

export function weekOrder(weekStartsOn: WeekStart) {
	return weekStartsOn === 6 ? [6, 0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6];
}
