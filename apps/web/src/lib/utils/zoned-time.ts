/*
 * Converting between a wall-clock day in a time zone and an instant, without a
 * date library. Used for time off, which therapists think of as whole days.
 */

function offsetMs(instant: Date, timeZone: string) {
	const parts = Object.fromEntries(
		new Intl.DateTimeFormat("en-US", {
			timeZone,
			hourCycle: "h23",
			year: "numeric",
			month: "numeric",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
		})
			.formatToParts(instant)
			.map((part) => [part.type, Number(part.value)]),
	);
	const asUtc = Date.UTC(
		parts.year ?? 0,
		(parts.month ?? 1) - 1,
		parts.day ?? 1,
		parts.hour ?? 0,
		parts.minute ?? 0,
		parts.second ?? 0,
	);
	return asUtc - instant.getTime();
}

/** Midnight at the start of `day` ("2026-12-24") in `timeZone`. */
export function startOfZonedDay(day: string, timeZone: string) {
	const [year = 0, month = 1, date = 1] = day.split("-").map(Number);
	const guess = Date.UTC(year, month - 1, date);
	const first = offsetMs(new Date(guess), timeZone);
	const result = guess - first;
	const second = offsetMs(new Date(result), timeZone);
	return new Date(second === first ? result : guess - second);
}

export function addDays(day: string, amount: number) {
	const [year = 0, month = 1, date = 1] = day.split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, date + amount))
		.toISOString()
		.slice(0, 10);
}

/** The wall-clock time ("09:30") of an instant in `timeZone`. */
export function zonedTime(instant: Date, timeZone: string) {
	return new Intl.DateTimeFormat("en-GB", {
		timeZone,
		hourCycle: "h23",
		hour: "2-digit",
		minute: "2-digit",
	}).format(instant);
}

/** The calendar day ("2026-12-24") an instant falls on in `timeZone`. */
export function zonedDay(instant: Date, timeZone: string) {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(instant);
}
