import { AppointmentStatusValues } from "@/modules/appointment/domain/appointment";
import { appointment } from "@/modules/appointment/infrastructure/persistence/appointment.schema";
import { database } from "@/modules/shared/infrastructure/database/client";
import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { DoctorAppointment, ScheduleAppointmentSource } from "../../domain/schedule-appointment-source";

const activeAppointmentStatuses = [
  AppointmentStatusValues.SCHEDULED,
  AppointmentStatusValues.CONFIRMED,
  AppointmentStatusValues.PAYED,
  AppointmentStatusValues.READY,
  AppointmentStatusValues.STARTED,
];

export class DrizzleScheduleAppointmentSource implements ScheduleAppointmentSource {
  async listByDoctorId(doctor_id: string, date_from: Date, date_to: Date): Promise<DoctorAppointment[]> {
    const items = await database
      .select({
        date: appointment.date,
      })
      .from(appointment)
      .where(
        and(
          eq(appointment.doctor_id, doctor_id),
          inArray(appointment.status, activeAppointmentStatuses),
          gte(appointment.date, date_from),
          lte(appointment.date, date_to),
        ),
      );

    return items;
  }
}

