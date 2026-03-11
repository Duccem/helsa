import { AvailabilitySlot, AvailabilitySlotStateValues } from "./availability-slot";
import { DoctorAppointment } from "./schedule-appointment-source";
import { Schedule } from "./schedule";
import {
  addMinutes,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  formatISO,
  getDay,
  isBefore,
  set,
  startOfDay,
  startOfMonth,
} from "date-fns";

function formatTime(h: number, m: number, s = 0) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function parseTime(t: string) {
  const [hh, mm, ss] = t.split(":");
  return { h: Number(hh), m: Number(mm), s: Number(ss || 0) };
}

export class ScheduleAvailabilityGenerator {
  static getNextMonthRange(): { date_from: Date; date_to: Date } {
    const now = new Date();
    const firstNext = startOfMonth(addMonths(now, 1));
    const start = startOfDay(firstNext);
    const end = endOfMonth(firstNext);
    return { date_from: start, date_to: end };
  }

  static indexTakenAvailabilities(slots: AvailabilitySlot[]): {
    taken_key_set: Set<string>;
    take_count_per_day: Map<string, number>;
  } {
    const takenAvailabilities = slots.map((slot) => slot.toPrimitives());
    const taken_key_set = new Set<string>();
    const take_count_per_day = new Map<string, number>(); // key: therapistId|YYYY-MM-DD
    for (const t of takenAvailabilities) {
      const dateKey = t.date.toISOString().split("T")[0];
      const therapistDayKey = `${t.doctor_id}|${dateKey}`;
      const slotKey = `${t.doctor_id}|${dateKey}|${String(t.hour)}`;
      taken_key_set.add(slotKey);
      take_count_per_day.set(therapistDayKey, (take_count_per_day.get(therapistDayKey) ?? 0) + 1);
    }
    return { taken_key_set, take_count_per_day } as {
      taken_key_set: Set<string>;
      take_count_per_day: Map<string, number>;
    };
  }

  static generate(
    schedule: Schedule,
    take_count_per_day: Map<string, number>,
    taken_key_set: Set<string>,
    date_from: Date,
    date_to: Date,
  ): AvailabilitySlot[] {
    const primitives = schedule.toPrimitives();
    const dayMap = new Map<number, { start_hour: string; end_hour: string }>();
    for (const d of primitives.days ?? []) {
      dayMap.set(d.day as number, {
        start_hour: String(d.start_hour),
        end_hour: String(d.end_hour),
      });
    }

    const slotsToInsert: AvailabilitySlot[] = [];

    for (const dt of eachDayOfInterval({ start: date_from, end: date_to })) {
      const weekday = getDay(dt); // 0=Sunday .. 6=Saturday
      const scheduleForDay = dayMap.get(weekday);
      if (!scheduleForDay) continue; // Therapist does not work this day

      const { start_hour, end_hour } = scheduleForDay;
      const startParsed = parseTime(start_hour as string);
      const endParsed = parseTime(end_hour as string);

      // Build list of time slots stepping by appointmentDuration minutes
      let cursor = set(dt, {
        hours: startParsed.h,
        minutes: startParsed.m,
        seconds: startParsed.s,
        milliseconds: 0,
      });
      const endTime = set(dt, {
        hours: endParsed.h,
        minutes: endParsed.m,
        seconds: endParsed.s,
        milliseconds: 0,
      });

      const daySlots: string[] = [];
      while (isBefore(cursor, endTime)) {
        daySlots.push(formatTime(cursor.getHours(), cursor.getMinutes(), cursor.getSeconds()));
        cursor = addMinutes(cursor, primitives.appointment_duration);
      }

      // Remaining capacity after already taken slots
      const dayKey = formatISO(startOfDay(dt), { representation: "date" });
      const takenForDay = (take_count_per_day as Map<string, number>).get(dayKey) ?? 0;
      const remainingCapacity = Math.max((primitives.max_appointments_per_day ?? daySlots.length) - takenForDay, 0);
      if (remainingCapacity === 0) continue;

      // Filter out slots already taken
      const candidate = daySlots.filter((h) => !(taken_key_set as Set<string>).has(`${dayKey}|${h}`));
      const limited = candidate.slice(0, remainingCapacity);
      for (const hour of limited) {
        slotsToInsert.push(
          AvailabilitySlot.create(primitives.doctor_id, dt, hour, AvailabilitySlotStateValues.AVAILABLE),
        );
      }
    }
    return slotsToInsert;
  }
}

