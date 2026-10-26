import { asc, desc, eq } from "@helsa/db/operators";
import { exchange_rate } from "@helsa/db/schema/payment";
import { user_settings } from "@helsa/db/schema/settings";
import {
	availability_block,
	availability_rule,
	therapist,
	therapist_rate,
} from "@helsa/db/schema/therapist";

import {
	type CountryCode,
	countries,
	defaultNotifications,
	defaultPreferences,
	type LanguageCode,
	languages,
	type Modality,
	type PaymentMethod,
	type PreferencesInput,
	paymentMethods,
	type TherapistSettings,
	withDefaults,
} from "@/components/dashboard/settings/schema";
import { db } from "@/services";

import { addDays, zonedDay } from "./utils/zoned-time";

/** The database counts weekdays from Sunday; the app counts from Monday. */
export const toAppWeekday = (weekday: number) => (weekday + 6) % 7;
export const toDbWeekday = (weekday: number) => (weekday + 1) % 7;

const hhmm = (time: string) => time.slice(0, 5);

/**
 * Therapists get their professional row the first time they save anything,
 * named after their account until they change it.
 */
export async function ensureTherapist(user: { id: string; name: string }) {
	await db
		.insert(therapist)
		.values({ user_id: user.id, display_name: user.name })
		.onConflictDoNothing({ target: therapist.user_id });
}

export async function loadPreferences(
	userId: string,
): Promise<PreferencesInput> {
	const [row] = await db
		.select({ preferences: user_settings.preferences })
		.from(user_settings)
		.where(eq(user_settings.user_id, userId))
		.limit(1);
	return withDefaults(defaultPreferences, row?.preferences);
}

export async function loadTherapistSettings(user: {
	id: string;
	name: string;
	email: string;
}): Promise<TherapistSettings> {
	const [[profile], rules, blocks, rates, [settings], [rate]] =
		await Promise.all([
			db
				.select()
				.from(therapist)
				.where(eq(therapist.user_id, user.id))
				.limit(1),
			db
				.select()
				.from(availability_rule)
				.where(eq(availability_rule.therapist_id, user.id))
				.orderBy(
					asc(availability_rule.weekday),
					asc(availability_rule.start_time),
				),
			db
				.select()
				.from(availability_block)
				.where(eq(availability_block.therapist_id, user.id))
				.orderBy(asc(availability_block.starts_at)),
			db
				.select()
				.from(therapist_rate)
				.where(eq(therapist_rate.therapist_id, user.id))
				.orderBy(asc(therapist_rate.position), asc(therapist_rate.created_at)),
			db
				.select()
				.from(user_settings)
				.where(eq(user_settings.user_id, user.id))
				.limit(1),
			db
				.select({ ves_per_usd: exchange_rate.ves_per_usd })
				.from(exchange_rate)
				.orderBy(desc(exchange_rate.rate_date))
				.limit(1),
		]);

	const timezone = profile?.timezone ?? "America/Caracas";
	const now = new Date();
	const sessionMinutes = profile?.default_session_minutes ?? 50;

	const countryCode = (
		profile?.country_code && profile.country_code in countries
			? profile.country_code
			: "VE"
	) as CountryCode;

	return {
		email: user.email,
		vesPerUsd: rate ? Number(rate.ves_per_usd) : null,
		professional: {
			displayName: profile?.display_name ?? user.name,
			professionalTitle: profile?.professional_title ?? "",
			licenseNumber: profile?.license_number ?? "",
			licenseBody: profile?.license_body ?? "",
			licenseVerified: Boolean(profile?.license_verified_at),
			yearsExperience: profile?.years_experience ?? null,
			bio: profile?.bio ?? "",
			specialties: profile?.specialties ?? [],
			languages: (profile?.languages ?? ["es"]).filter(
				(code): code is LanguageCode => code in languages,
			),
			phone: profile?.phone_e164 ?? "",
			countryCode,
		},
		schedule: {
			timezone,
			sessionMinutes,
			bufferMinutes: profile?.default_buffer_minutes ?? 10,
			ranges: rules.map((rule) => ({
				weekday: toAppWeekday(rule.weekday),
				start: hhmm(rule.start_time),
				end: hhmm(rule.end_time),
			})),
		},
		// Only time off that hasn't ended yet; the past lives in the agenda.
		timeOff: blocks
			.filter((block) => block.ends_at > now)
			.map((block) => ({
				id: block.id,
				startsOn: zonedDay(block.starts_at, timezone),
				// Stored as the midnight after the last day off.
				endsOn: addDays(zonedDay(block.ends_at, timezone), -1),
				reason: block.reason,
			})),
		pricing: {
			rates:
				rates.length > 0
					? rates.map((row) => ({
						id: row.id,
						name: row.name,
						durationMinutes: row.duration_minutes,
						priceUsd: Number(row.price_usd),
						modality: row.modality as Modality | null,
						isActive: row.is_active,
					}))
					: [
						{
							name: "Sesión individual",
							durationMinutes: sessionMinutes,
							priceUsd: profile?.default_price_usd
								? Number(profile.default_price_usd)
								: 40,
							modality: null,
							isActive: true,
						},
					],
			paymentMethods: (profile?.payment_methods ?? []).filter(
				(method): method is PaymentMethod =>
					(paymentMethods as readonly string[]).includes(method),
			),
			paymentInstructions: profile?.payment_instructions ?? "",
		},
		booking: {
			enabled: profile?.booking_enabled ?? false,
			slug: profile?.booking_slug ?? "",
			modalities: (profile?.modalities ?? ["video"]) as Modality[],
			officeAddress: profile?.office_address ?? "",
			noticeHours: profile?.booking_notice_hours ?? 12,
			cancellationHours: profile?.cancellation_notice_hours ?? 24,
		},
		notifications: {
			remindersEnabled: profile?.reminders_enabled ?? true,
			...withDefaults(defaultNotifications, settings?.notifications),
		} as TherapistSettings["notifications"],
		preferences: withDefaults(defaultPreferences, settings?.preferences),
	};
}

/** Saves one part of `user_settings` without touching the other. */
export async function saveUserSettings(
	userId: string,
	patch: Partial<
		Pick<typeof user_settings.$inferInsert, "preferences" | "notifications">
	>,
) {
	await db
		.insert(user_settings)
		.values({ user_id: userId, ...patch })
		.onConflictDoUpdate({ target: user_settings.user_id, set: patch });
}
