import { database } from "@/modules/shared/infrastructure/database/client";
import { DoctorHomeMetrics } from "../domain/home-metric";
import { HomeMetricRepository } from "../domain/home-metric-repository";
import { and, count, eq, gte, lt, countDistinct } from "drizzle-orm";
import { appointment } from "@/modules/appointment/infrastructure/persistence/appointment.schema";
import { endOfDay, startOfDay } from "date-fns";

// TODO: Implement patient satisfaction and pending records
export class DrizzleHomeMetricRepository extends HomeMetricRepository {
  async getMetrics(date: Date, doctor_id: string): Promise<DoctorHomeMetrics> {
    const from = startOfDay(date);
    const to = endOfDay(date);
    const [totalAppointments, inProgressAppointments, totalPatients] = await Promise.all([
      database
        .select({ count: count(appointment.id) })
        .from(appointment)
        .where(and(gte(appointment.date, from), lt(appointment.date, to), eq(appointment.doctor_id, doctor_id))),
      database
        .select({ count: count(appointment.id) })
        .from(appointment)
        .where(
          and(
            gte(appointment.date, from),
            lt(appointment.date, to),
            eq(appointment.doctor_id, doctor_id),
            eq(appointment.status, "IN_PROGRESS"),
          ),
        ),
      database
        .select({ count: countDistinct(appointment.patient_id) })
        .from(appointment)
        .where(and(eq(appointment.doctor_id, doctor_id))),
    ]);
    return {
      in_progress_appointments: inProgressAppointments[0]?.count ?? 0,
      total_patients: totalPatients[0]?.count ?? 0,
      patient_satisfaction: 0,
      pending_records: 0,
      total_appointments: totalAppointments[0]?.count ?? 0,
    };
  }
}

