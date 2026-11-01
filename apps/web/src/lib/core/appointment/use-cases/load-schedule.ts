import type { BetterUser } from "@helsa/auth";
import { addDays, startOfZonedDay, zonedDay, zonedTime } from "@/lib/utils/zoned-time";
import { LoadPreferences } from "../../settings/use-cases/load-preferences";
import { TherapistRepository } from "../../therapist/adapters/therapist-repository";
import { AppointmentRepository } from "../adapters/appointment-repository";
import { PENDING_STATUSES } from "./count-pending-appointments";

type LoadScheduleInput = {
  /** "2026-11"; falls back to the current month when missing or malformed. */
  month?: string;
  now?: Date;
};

type Row = Awaited<ReturnType<AppointmentRepository["getStartingBetween"]>>[number];

const DEFAULT_TIMEZONE = "America/Caracas";
const UPCOMING_LIMIT = 30;

export class LoadSchedule {
  private appointments = new AppointmentRepository();
  private therapists = new TherapistRepository();
  private preferences = new LoadPreferences();

  async execute(data: LoadScheduleInput, user: BetterUser) {
    const now = data.now ?? new Date();
    const [therapist, preferences] = await Promise.all([
      this.therapists.getById(user.id),
      this.preferences.execute(user.id),
    ]);

    const timezone = therapist?.timezone ?? DEFAULT_TIMEZONE;
    const today = zonedDay(now, timezone);
    const month = this.isMonth(data.month) ? data.month : today.slice(0, 7);

    // The grid shows a few days of the neighbouring months, so load a week on each side.
    const first = `${month}-01`;
    const from = startOfZonedDay(addDays(first, -7), timezone);
    const to = startOfZonedDay(addDays(this.nextMonth(month), 7), timezone);

    const [inMonth, upcoming] = await Promise.all([
      this.appointments.getStartingBetween(user.id, from, to),
      this.appointments.getUpcoming(user.id, now, PENDING_STATUSES, UPCOMING_LIMIT),
    ]);

    return {
      timezone,
      today,
      month,
      nowIso: now.toISOString(),
      upcomingLimit: UPCOMING_LIMIT,
      timeFormat: preferences.timeFormat === "12h" ? ("12h" as const) : ("24h" as const),
      weekStartsOn: preferences.weekStartsOn === 6 ? (6 as const) : (0 as const),
      appointments: inMonth.map((row) => this.toEntry(row, timezone)),
      upcoming: upcoming.map((row) => this.toEntry(row, timezone)),
    };
  }

  private toEntry(row: Row, timezone: string) {
    const name = row.preferred_name?.trim() || row.first_name;
    return {
      id: row.id,
      startsAt: row.starts_at.toISOString(),
      endsAt: row.ends_at.toISOString(),
      day: zonedDay(row.starts_at, timezone),
      time: zonedTime(row.starts_at, timezone),
      minutes: Math.round((row.ends_at.getTime() - row.starts_at.getTime()) / 60_000),
      modality: row.modality,
      status: row.status,
      bookedVia: row.booked_via,
      location: row.location,
      recurring: row.series_id !== null,
      patient: { id: row.patient_id, name: `${name} ${row.last_name}`.trim() },
    };
  }

  private isMonth(value: string | undefined): value is string {
    if (!value || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return false;
    const year = Number(value.slice(0, 4));
    return year >= 2000 && year <= 2100;
  }

  private nextMonth(month: string) {
    const [year = 0, index = 1] = month.split("-").map(Number);
    return new Date(Date.UTC(year, index, 1)).toISOString().slice(0, 10);
  }
}

export type ScheduleData = Awaited<ReturnType<LoadSchedule["execute"]>>;
export type ScheduleEntry = ScheduleData["appointments"][number];
