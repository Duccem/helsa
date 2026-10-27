import type { BetterUser } from "@helsa/auth";
import type { NotificationPreferences } from "@helsa/db/schema/settings";
import { hhmm, toAppWeekday } from "@/lib/utils/transformers";
import { withDefaults } from "@/lib/utils/with-defaults";
import { addDays, zonedDay } from "@/lib/utils/zoned-time";
import { TherapistRepository } from "../../therapist/adapters/therapist-repository";
import { SettingsRepository } from "../adapters/settings-repository";

const defaultPreferences = {
  timeFormat: "24h",
  weekStartsOn: 0,
  currencyDisplay: "both",
  privateMode: false,
};

const defaultNotifications: NotificationPreferences = {
  events: {
    booking_new: ["app", "email"],
    booking_cancelled: ["app", "email"],
    reschedule_request: ["app", "email"],
    task_completed: ["app"],
    payment_recorded: ["app"],
    reminder_failed: ["app", "email"],
    weekly_summary: ["email"],
  },
  patientReminders: { h24: true, h2: true, channel: "whatsapp" },
  quietHours: { enabled: true, from: "21:00", to: "07:00" },
}

export class LoadTherapistSettings {
  private therapistRepository = new TherapistRepository();
  private settingsRepository = new SettingsRepository();

  async execute(user: BetterUser) {
    const [profile, settings, rates, rules, blocks] = await Promise.all([
      this.therapistRepository.getById(user.id),
      this.settingsRepository.getSettings(user.id),
      this.therapistRepository.getRates(user.id),
      this.therapistRepository.getRules(user.id),
      this.therapistRepository.getTimeOffs(user.id)
    ]);

    return {
      email: user.email,
      vesPerUsd: 1000,
      professional: {
        displayName: profile?.display_name ?? user.name,
        professionalTitle: profile?.professional_title ?? "",
        licenseNumber: profile?.license_number ?? "",
        licenseBody: profile?.license_body ?? "",
        licenseVerified: Boolean(profile?.license_verified_at),
        yearsExperience: profile?.years_experience ?? null,
        bio: profile?.bio ?? "",
        specialties: profile?.specialties ?? [],
        languages: profile.languages ?? [],
        phone: profile?.phone_e164 ?? "",
        countryCode: profile?.country_code ?? "VE",
      },
      schedule: {
        timezone: profile?.timezone ?? "America/Caracas",
        sessionMinutes: profile?.default_session_minutes ?? 50,
        bufferMinutes: profile?.default_buffer_minutes ?? 10,
        ranges: rules.map((rule) => ({
          weekday: toAppWeekday(rule.weekday),
          start: hhmm(rule.start_time),
          end: hhmm(rule.end_time),
        })),
      },
      timeOff: blocks
        .filter((block) => block.ends_at > new Date())
        .map((block) => ({
          id: block.id,
          startsOn: zonedDay(block.starts_at, profile?.timezone ?? "America/Caracas"),
          // Stored as the midnight after the last day off.
          endsOn: addDays(zonedDay(block.ends_at, profile?.timezone ?? "America/Caracas"), -1),
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
              modality: row.modality,
              isActive: row.is_active,
            }))
            : [
              {
                name: "Sesión individual",
                durationMinutes: profile?.default_session_minutes ?? 50,
                priceUsd: profile?.default_price_usd
                  ? Number(profile.default_price_usd)
                  : 40,
                modality: null,
                isActive: true,
              },
            ],
        paymentMethods: (profile?.payment_methods ?? []),
        paymentInstructions: profile?.payment_instructions ?? "",
      },
      booking: {
        enabled: profile?.booking_enabled ?? false,
        slug: profile?.booking_slug ?? "",
        modalities: (profile?.modalities ?? ["video"]),
        officeAddress: profile?.office_address ?? "",
        noticeHours: profile?.booking_notice_hours ?? 12,
        cancellationHours: profile?.cancellation_notice_hours ?? 24,
      },
      notifications: {
        remindersEnabled: profile?.reminders_enabled ?? true,
        ...withDefaults(defaultNotifications, settings.notifications),
      },
      preferences: withDefaults(defaultPreferences, settings?.preferences),
    }
  }
}