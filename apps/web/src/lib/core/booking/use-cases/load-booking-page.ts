import { addDays, startOfZonedDay, zonedDay, zonedTime } from "@/lib/utils/zoned-time";
import { AppointmentRepository } from "../../appointment/adapters/appointment-repository";
import { TherapistRepository } from "../../therapist/adapters/therapist-repository";
import { type Busy, daySlots, type Modality } from "../domain/availability";
import { BookingPageNotFound } from "../domain/errors";
import { bookingRates, HORIZON_DAYS, rateModalities, slotKey } from "../domain/options";

const HOUR = 3_600_000;

/** Everything the public booking page needs. Nothing private leaves this use case. */
export class LoadBookingPage {
  private therapists = new TherapistRepository();
  private appointments = new AppointmentRepository();

  async execute(slug: string, now = new Date()) {
    const therapist = await this.therapists.getBySlug(slug.toLowerCase());

    if (!therapist || !therapist.booking_enabled) {
      throw new BookingPageNotFound();
    }

    const timezone = therapist.timezone;
    const today = zonedDay(now, timezone);
    const horizonEnd = startOfZonedDay(addDays(today, HORIZON_DAYS), timezone);

    const [rules, rates, blocks, taken, image] = await Promise.all([
      this.therapists.getRules(therapist.user_id),
      this.therapists.getRates(therapist.user_id),
      this.therapists.getTimeOffs(therapist.user_id),
      this.appointments.getBusyBetween(therapist.user_id, now, horizonEnd),
      this.therapists.getAccountImage(therapist.user_id),
    ]);

    const busy: Busy[] = [
      ...taken.map((item) => ({ start: item.starts_at.getTime(), end: item.ends_at.getTime() })),
      ...blocks.map((item) => ({ start: item.starts_at.getTime(), end: item.ends_at.getTime() })),
    ];
    const ranges = rules.map((rule) => ({
      weekday: rule.weekday,
      start: rule.start_time,
      end: rule.end_time,
      modality: rule.modality,
    }));
    const earliest = now.getTime() + therapist.booking_notice_hours * HOUR;
    const options = bookingRates(therapist, rates);

    // One calendar per (length, modality) pair the page can ask for.
    const availability: Record<string, Array<{ day: string; slots: Array<{ startsAt: string; time: string }> }>> = {};
    for (const rate of options) {
      for (const modality of rateModalities(therapist, rate)) {
        const key = slotKey(rate.minutes, modality);
        if (availability[key]) continue;
        availability[key] = this.calendar({
          today,
          timezone,
          ranges,
          modality,
          durationMinutes: rate.minutes,
          bufferMinutes: therapist.default_buffer_minutes,
          earliest,
          busy,
        });
      }
    }

    return {
      today,
      timezone,
      therapist: {
        slug: therapist.booking_slug ?? slug,
        name: therapist.display_name,
        title: therapist.professional_title,
        image,
        licenseVerified: therapist.license_verified_at !== null,
        bio: therapist.bio,
        yearsExperience: therapist.years_experience,
        specialties: therapist.specialties,
        languages: therapist.languages,
        officeAddress: therapist.office_address,
        cancellationHours: therapist.cancellation_notice_hours,
        paymentMethods: therapist.payment_methods,
        paymentInstructions: therapist.payment_instructions,
      },
      rates: options.map((rate) => ({ ...rate, modalities: rateModalities(therapist, rate) })),
      availability,
    };
  }

  private calendar(input: {
    today: string;
    timezone: string;
    ranges: Parameters<typeof daySlots>[0]["ranges"];
    modality: Modality;
    durationMinutes: number;
    bufferMinutes: number;
    earliest: number;
    busy: Busy[];
  }) {
    const days = [];
    for (let offset = 0; offset < HORIZON_DAYS; offset++) {
      const day = addDays(input.today, offset);
      const slots = daySlots({ ...input, day });
      if (slots.length === 0) continue;
      days.push({
        day,
        slots: slots.map((start) => {
          const instant = new Date(start);
          return { startsAt: instant.toISOString(), time: zonedTime(instant, input.timezone) };
        }),
      });
    }
    return days;
  }
}

export type BookingPage = Awaited<ReturnType<LoadBookingPage["execute"]>>;
