import { startOfZonedDay } from "@/lib/utils/zoned-time";

export type Modality = "video" | "in_person" | "phone";

/** A weekly opening, as stored: weekday 0 = Sunday, times "HH:MM[:SS]". */
export type WeeklyRange = {
  weekday: number;
  start: string;
  end: string;
  modality: Modality | null;
};

/** Time already taken (appointments or time off), in ms. */
export type Busy = { start: number; end: number };

type DaySlotsInput = {
  /** Calendar day in the therapist's time zone, "2026-11-03". */
  day: string;
  timezone: string;
  ranges: WeeklyRange[];
  modality: Modality;
  durationMinutes: number;
  bufferMinutes: number;
  /** Nothing can start before this instant (now + booking notice). */
  earliest: number;
  busy: Busy[];
};

const MINUTE = 60_000;

function minutesOf(time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function weekdayOf(day: string) {
  return new Date(`${day}T00:00:00Z`).getUTCDay();
}

/**
 * Start instants (ms) that can be booked on one day. Each opening is cut into
 * sessions of `duration + buffer`, the same way the settings preview does, and
 * a slot is dropped when it is too soon or touches something already taken
 * (keeping the buffer on both sides).
 */
export function daySlots(input: DaySlotsInput) {
  const midnight = startOfZonedDay(input.day, input.timezone).getTime();
  const weekday = weekdayOf(input.day);
  const step = input.durationMinutes + input.bufferMinutes;
  const buffer = input.bufferMinutes * MINUTE;
  const starts = new Set<number>();

  for (const range of input.ranges) {
    if (range.weekday !== weekday) continue;
    if (range.modality && range.modality !== input.modality) continue;
    const close = minutesOf(range.end);
    for (
      let minute = minutesOf(range.start);
      minute + input.durationMinutes <= close;
      minute += step
    ) {
      const start = midnight + minute * MINUTE;
      const end = start + input.durationMinutes * MINUTE;
      if (start < input.earliest) continue;
      const clashes = input.busy.some(
        (taken) => start < taken.end + buffer && taken.start < end + buffer,
      );
      if (!clashes) starts.add(start);
    }
  }

  return [...starts].sort((a, b) => a - b);
}
