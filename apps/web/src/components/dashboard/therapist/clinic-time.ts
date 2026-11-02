/*
 * Clock helpers in the therapist's time zone. Everything is computed from
 * explicit parts (never the machine's local time), so the server and the
 * browser render the same week, greeting and countdown.
 */

// Fallback when the therapist has no time zone yet (`therapist.timezone` defaults to it).
export const CLINIC_TZ = "America/Caracas";

export const dayNames = [
	"Lunes",
	"Martes",
	"Miércoles",
	"Jueves",
	"Viernes",
	"Sábado",
	"Domingo",
] as const;

export const dayShort = [
	"Lun",
	"Mar",
	"Mié",
	"Jue",
	"Vie",
	"Sáb",
	"Dom",
] as const;

export const monthNames = [
	"enero",
	"febrero",
	"marzo",
	"abril",
	"mayo",
	"junio",
	"julio",
	"agosto",
	"septiembre",
	"octubre",
	"noviembre",
	"diciembre",
] as const;

const weekdayIndex: Record<string, number> = {
	Mon: 0,
	Tue: 1,
	Wed: 2,
	Thu: 3,
	Fri: 4,
	Sat: 5,
	Sun: 6,
};

export type ClinicNow = {
	year: number;
	/** 1–12 */
	month: number;
	day: number;
	/** 0 = Monday … 6 = Sunday */
	weekday: number;
	/** Minutes since midnight. */
	minutes: number;
};

const formatters = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string) {
	let formatter = formatters.get(timeZone);
	if (!formatter) {
		formatter = new Intl.DateTimeFormat("en-US", {
			timeZone,
			year: "numeric",
			month: "numeric",
			day: "numeric",
			weekday: "short",
			hour: "numeric",
			minute: "numeric",
			hourCycle: "h23",
		});
		formatters.set(timeZone, formatter);
	}
	return formatter;
}

export function clinicNow(date: Date, timeZone: string = CLINIC_TZ): ClinicNow {
	const parts = Object.fromEntries(
		partsFormatter(timeZone)
			.formatToParts(date)
			.map((part) => [part.type, part.value]),
	);
	return {
		year: Number(parts.year),
		month: Number(parts.month),
		day: Number(parts.day),
		weekday: weekdayIndex[parts.weekday] ?? 0,
		minutes: Number(parts.hour) * 60 + Number(parts.minute),
	};
}

/** "2026-11-03" for `now`, to compare with the days the server sends. */
export function isoDay(now: ClinicNow) {
	return `${now.year}-${String(now.month).padStart(2, "0")}-${String(now.day).padStart(2, "0")}`;
}

export type CalendarDay = {
	/** 0 = Monday … 6 = Sunday */
	weekday: number;
	day: number;
	/** 1–12 */
	month: number;
	/** Days from today (negative = past). */
	offset: number;
};

/** The calendar day `offset` days from `now`, in the clinic's calendar. */
export function calendarDay(now: ClinicNow, offset: number): CalendarDay {
	const date = new Date(Date.UTC(now.year, now.month - 1, now.day + offset));
	return {
		weekday: (now.weekday + offset + 7 * 10) % 7,
		day: date.getUTCDate(),
		month: date.getUTCMonth() + 1,
		offset,
	};
}

/** Monday to Sunday of the current week. */
export function currentWeek(now: ClinicNow): CalendarDay[] {
	return Array.from({ length: 7 }, (_, index) =>
		calendarDay(now, index - now.weekday),
	);
}

export function toMinutes(time: string) {
	const [hours = 0, minutes = 0] = time.split(":").map(Number);
	return hours * 60 + minutes;
}

/** "08:00" → "8:00" */
export function formatTime(time: string) {
	return time.replace(/^0/, "");
}

export function formatDuration(minutes: number) {
	if (minutes < 60) return `${minutes} min`;
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

export function greeting(minutes: number) {
	if (minutes < 12 * 60) return "Buenos días";
	if (minutes < 19 * 60) return "Buenas tardes";
	return "Buenas noches";
}
