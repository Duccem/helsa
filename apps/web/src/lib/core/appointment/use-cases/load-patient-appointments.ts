import type { BetterUser } from "@helsa/auth";
import { zonedDay, zonedTime } from "@/lib/utils/zoned-time";
import { EnsurePortalPatient } from "../../patient/use-cases/ensure-portal-patient";
import { TherapistRepository } from "../../therapist/adapters/therapist-repository";
import { AppointmentRepository } from "../adapters/appointment-repository";
import { canPatientCancel } from "../domain/cancellation";

const MAX_UPCOMING = 50;
const MAX_HISTORY = 30;

/** The patient's appointments: what's coming, with what they can do, and what already happened. */
export class LoadPatientAppointments {
  private portal = new EnsurePortalPatient();
  private therapists = new TherapistRepository();
  private appointments = new AppointmentRepository();

  async execute(user: BetterUser, now = new Date()) {
    const patient = await this.portal.execute(user);
    const timezone = patient.timezone;

    const [therapist, upcoming, history] = await Promise.all([
      this.therapists.getById(patient.therapist_id),
      this.appointments.getUpcomingForPatient(patient.id, now, MAX_UPCOMING),
      this.appointments.getHistoryForPatient(patient.id, now, MAX_HISTORY),
    ]);
    const noticeHours = therapist?.cancellation_notice_hours ?? 24;

    const base = (row: { id: string; starts_at: Date; ends_at: Date }) => ({
      id: row.id,
      day: zonedDay(row.starts_at, timezone),
      time: zonedTime(row.starts_at, timezone),
      startsAt: row.starts_at.toISOString(),
      endsAt: row.ends_at.toISOString(),
      minutes: Math.round((row.ends_at.getTime() - row.starts_at.getTime()) / 60_000),
    });

    return {
      nowIso: now.toISOString(),
      timezone,
      today: zonedDay(now, timezone),
      therapist: {
        name: therapist?.display_name ?? "Tu terapeuta",
        phone: therapist?.phone_e164 ?? null,
      },
      noticeHours,
      bookingSlug: therapist?.booking_enabled && therapist.booking_slug ? therapist.booking_slug : null,
      upcoming: upcoming.map((row) => ({
        ...base(row),
        modality: row.modality,
        status: row.status,
        location: row.location ?? (row.modality === "in_person" ? row.office_address : null),
        recurring: row.series_id !== null,
        canConfirm: row.status === "scheduled",
        canCancel: canPatientCancel(row.starts_at, noticeHours, now),
      })),
      history: history.map((row) => ({
        ...base(row),
        modality: row.modality,
        status: row.status,
        cancelledBy: row.cancelled_by,
      })),
    };
  }
}

export type PatientAppointments = Awaited<ReturnType<LoadPatientAppointments["execute"]>>;
export type PortalAppointment = PatientAppointments["upcoming"][number];
export type PortalPastAppointment = PatientAppointments["history"][number];
