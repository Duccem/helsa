import type { NotificationPreferences } from "@helsa/db/schema/settings";

export type ReminderKind = "h24" | "h2";
export type ReminderChannel = "whatsapp" | "email";
export type ReminderStatus = "pending" | "sent" | "failed" | "skipped";

const HOUR = 3_600_000;

/** How far ahead of the session each reminder goes out. */
export const REMINDER_LEAD: Record<ReminderKind, number> = {
	h24: 24 * HOUR,
	h2: 2 * HOUR,
};

/** Same defaults the settings page shows when the therapist never saved any. */
export const defaultPatientReminders: NotificationPreferences["patientReminders"] =
	{
		h24: true,
		h2: true,
		channel: "whatsapp",
	};

/**
 * The reminder a session is due for right now, or null. Inside the last two
 * hours it's "h2"; before that, up to a day ahead, it's "h24". A session
 * booked late only gets the reminders whose window it still falls in.
 */
export function dueReminder(starts_at: Date, now: Date): ReminderKind | null {
	const left = starts_at.getTime() - now.getTime();
	if (left <= 0) return null;
	if (left <= REMINDER_LEAD.h2) return "h2";
	if (left <= REMINDER_LEAD.h24) return "h24";
	return null;
}

/** The channels the therapist chose, in order of preference. */
export function preferredChannels(
	choice: NotificationPreferences["patientReminders"]["channel"],
): ReminderChannel[] {
	if (choice === "both") return ["whatsapp", "email"];
	return [choice];
}

const MODALITY_LABEL = {
	video: "Videollamada",
	in_person: "Presencial",
	phone: "Llamada telefónica",
} as const;

export function modalityLabel(modality: keyof typeof MODALITY_LABEL) {
	return MODALITY_LABEL[modality];
}

/** "martes, 12 de noviembre" and "15:00 (hora de Caracas)", in the patient's zone. */
export function formatSessionTime(starts_at: Date, timezone: string) {
	const date = new Intl.DateTimeFormat("es", {
		weekday: "long",
		day: "numeric",
		month: "long",
		timeZone: timezone,
	}).format(starts_at);
	const time = new Intl.DateTimeFormat("es", {
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
		timeZone: timezone,
	}).format(starts_at);
	const city = timezone.split("/").pop()?.replace(/_/g, " ");

	return { date, time, zone: city ? `hora de ${city}` : timezone };
}
