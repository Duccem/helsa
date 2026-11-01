import type { BetterUser } from "@helsa/auth";
import { addDays, startOfZonedDay, zonedDay, zonedTime } from "@/lib/utils/zoned-time";
import { AppointmentRepository } from "../../appointment/adapters/appointment-repository";
import { EnsureBookingPatient } from "../../patient/use-cases/ensure-booking-patient";
import { TherapistRepository } from "../../therapist/adapters/therapist-repository";
import type { Therapist } from "../../therapist/domain/types";
import { daySlots, type Modality } from "../domain/availability";
import {
  BookingPageNotFound,
  InvalidBookingOption,
  OwnBookingPage,
  PatientAccountRequired,
  SlotUnavailable,
} from "../domain/errors";
import { bookingRates, HORIZON_DAYS, rateModalities } from "../domain/options";

type BookAppointmentInput = {
  slug: string;
  rateId: string;
  modality: Modality;
  startsAt: string;
  paymentMethod: string | null;
};

const HOUR = 3_600_000;
const MINUTE = 60_000;

export class BookAppointment {
  private therapists = new TherapistRepository();
  private appointments = new AppointmentRepository();
  private patients = new EnsureBookingPatient();

  async execute(data: BookAppointmentInput, user: BetterUser) {
    const therapist = await this.therapists.getBySlug(data.slug.toLowerCase());

    if (!therapist || !therapist.booking_enabled) {
      throw new BookingPageNotFound();
    }
    if (therapist.user_id === user.id) {
      throw new OwnBookingPage();
    }
    if (user.role !== "patient") {
      throw new PatientAccountRequired();
    }

    const rate = bookingRates(therapist, await this.therapists.getRates(therapist.user_id)).find(
      (item) => item.id === data.rateId,
    );
    if (!rate) {
      throw new InvalidBookingOption("Elige un tipo de sesión de la lista");
    }
    if (!rateModalities(therapist, rate).includes(data.modality)) {
      throw new InvalidBookingOption("Esa modalidad no está disponible para esta sesión");
    }
    const methods = therapist.payment_methods;
    if (methods.length > 0 && !(data.paymentMethod && methods.includes(data.paymentMethod))) {
      throw new InvalidBookingOption("Elige cómo vas a pagar");
    }

    const start = new Date(data.startsAt);
    if (Number.isNaN(start.getTime())) {
      throw new SlotUnavailable();
    }
    await this.ensureSlotIsOffered(therapist, rate.minutes, data.modality, start);

    const patient = await this.patients.execute(
      { therapistId: therapist.user_id, timezone: therapist.timezone },
      user,
    );

    const end = new Date(start.getTime() + rate.minutes * MINUTE);
    const booked = await this.appointments.createIfFree(
      {
        therapist_id: therapist.user_id,
        patient_id: patient.id,
        starts_at: start,
        ends_at: end,
        modality: data.modality,
        status: "scheduled",
        booked_via: "booking_link",
        price_usd: rate.priceUsd === null ? null : rate.priceUsd.toFixed(2),
        location: data.modality === "in_person" ? therapist.office_address : null,
        payment_method: methods.length > 0 ? data.paymentMethod : null,
      },
      therapist.default_buffer_minutes,
    );

    if (!booked) {
      throw new SlotUnavailable();
    }

    return {
      therapistName: therapist.display_name,
      rateName: rate.name,
      minutes: rate.minutes,
      priceUsd: rate.priceUsd,
      modality: data.modality,
      startsAt: start.toISOString(),
      day: zonedDay(start, therapist.timezone),
      time: zonedTime(start, therapist.timezone),
      timezone: therapist.timezone,
      location: data.modality === "in_person" ? therapist.office_address : null,
      paymentMethod: methods.length > 0 ? data.paymentMethod : null,
      paymentInstructions: therapist.payment_instructions,
      cancellationHours: therapist.cancellation_notice_hours,
    };
  }

  /** The start must be one of the slots the page offers right now. */
  private async ensureSlotIsOffered(
    therapist: Therapist,
    minutes: number,
    modality: Modality,
    start: Date,
  ) {
    const now = new Date();
    const timezone = therapist.timezone;
    const day = zonedDay(start, timezone);
    const today = zonedDay(now, timezone);
    if (day < today || day >= addDays(today, HORIZON_DAYS)) {
      throw new SlotUnavailable();
    }

    const from = startOfZonedDay(day, timezone);
    const to = startOfZonedDay(addDays(day, 1), timezone);
    const [rules, blocks, taken] = await Promise.all([
      this.therapists.getRules(therapist.user_id),
      this.therapists.getTimeOffs(therapist.user_id),
      this.appointments.getBusyBetween(therapist.user_id, from, to),
    ]);

    const slots = daySlots({
      day,
      timezone,
      modality,
      durationMinutes: minutes,
      bufferMinutes: therapist.default_buffer_minutes,
      earliest: now.getTime() + therapist.booking_notice_hours * HOUR,
      ranges: rules.map((rule) => ({
        weekday: rule.weekday,
        start: rule.start_time,
        end: rule.end_time,
        modality: rule.modality,
      })),
      busy: [...taken, ...blocks].map((item) => ({
        start: item.starts_at.getTime(),
        end: item.ends_at.getTime(),
      })),
    });

    if (!slots.includes(start.getTime())) {
      throw new SlotUnavailable();
    }
  }
}

export type BookingConfirmation = Awaited<ReturnType<BookAppointment["execute"]>>;
