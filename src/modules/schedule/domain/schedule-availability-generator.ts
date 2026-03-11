import { AvailabilitySlot, AvailabilitySlotStateValues } from "./availability-slot";
import { DoctorAppointment } from "./schedule-appointment-source";
import { Schedule } from "./schedule";

const toMinuteKey = (date: Date): string => {
  const normalized = new Date(date);
  normalized.setSeconds(0, 0);
  return normalized.toISOString();
};

const withTime = (date: Date, hour: string): Date => {
  const [hours, minutes, seconds] = hour.split(":").map(Number);
  const value = new Date(date);
  value.setHours(hours, minutes, seconds ?? 0, 0);
  return value;
};

export class ScheduleAvailabilityGenerator {
  static generate(
    schedule: Schedule,
    appointments: DoctorAppointment[],
    date_from: Date,
    date_to: Date,
  ): AvailabilitySlot[] {
    const days = schedule.days ?? [];
    if (days.length === 0) {
      return [];
    }

    const appointmentKeys = new Set(appointments.map((item) => toMinuteKey(item.date)));
    const slots: AvailabilitySlot[] = [];

    const cursor = new Date(date_from);
    cursor.setHours(0, 0, 0, 0);

    const end = new Date(date_to);
    end.setHours(23, 59, 59, 999);

    while (cursor <= end) {
      const day = days.find((item) => item.day.value === cursor.getDay());

      if (day) {
        const start = withTime(cursor, day.start_hour.value);
        const finish = withTime(cursor, day.end_hour.value);
        const durationInMs = schedule.appointment_duration.value * 60 * 1000;

        let appointmentsForDay = 0;
        for (let current = new Date(start); current < finish; current = new Date(current.getTime() + durationInMs)) {
          if (appointmentsForDay >= schedule.max_appointments_per_day.value) {
            break;
          }

          const state = appointmentKeys.has(toMinuteKey(current))
            ? AvailabilitySlotStateValues.TAKEN
            : AvailabilitySlotStateValues.AVAILABLE;

          slots.push(AvailabilitySlot.create(schedule.doctor_id.value, new Date(current), state));
          appointmentsForDay += 1;
        }
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return slots;
  }
}

