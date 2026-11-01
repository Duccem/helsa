import { and, asc, desc, eq, gt, gte, inArray, lt, sql } from "@helsa/db/operators";
import { appointment } from "@helsa/db/schema/appointment";
import { patient } from "@helsa/db/schema/patient";
import { db } from "@/services";
import type { AppointmentStatus } from "../domain/types";

const withPatient = {
  id: appointment.id,
  starts_at: appointment.starts_at,
  ends_at: appointment.ends_at,
  modality: appointment.modality,
  status: appointment.status,
  booked_via: appointment.booked_via,
  location: appointment.location,
  series_id: appointment.series_id,
  patient_id: patient.id,
  first_name: patient.first_name,
  last_name: patient.last_name,
  preferred_name: patient.preferred_name,
};

export class AppointmentRepository {
  /** Appointments that start inside [from, to), any status. */
  async getStartingBetween(therapist_id: string, from: Date, to: Date) {
    return db
      .select(withPatient)
      .from(appointment)
      .innerJoin(patient, eq(patient.id, appointment.patient_id))
      .where(
        and(
          eq(appointment.therapist_id, therapist_id),
          gte(appointment.starts_at, from),
          lt(appointment.starts_at, to),
        ),
      )
      .orderBy(asc(appointment.starts_at));
  }

  /** Appointments not finished yet at `from`, soonest first. */
  async getUpcoming(
    therapist_id: string,
    from: Date,
    statuses: AppointmentStatus[],
    limit: number,
  ) {
    return db
      .select(withPatient)
      .from(appointment)
      .innerJoin(patient, eq(patient.id, appointment.patient_id))
      .where(
        and(
          eq(appointment.therapist_id, therapist_id),
          gt(appointment.ends_at, from),
          inArray(appointment.status, statuses),
        ),
      )
      .orderBy(asc(appointment.starts_at))
      .limit(limit);
  }

  /** Appointments not finished at `from` that start before `to`. */
  async countUpcoming(
    therapist_id: string,
    from: Date,
    to: Date,
    statuses: AppointmentStatus[],
  ) {
    const [response] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(appointment)
      .where(
        and(
          eq(appointment.therapist_id, therapist_id),
          gt(appointment.ends_at, from),
          lt(appointment.starts_at, to),
          inArray(appointment.status, statuses),
        ),
      );

    return response?.count ?? 0;
  }

  /** Every appointment of one patient, newest first. */
  async getByPatient(patient_id: string, therapist_id: string) {
    return db
      .select()
      .from(appointment)
      .where(
        and(
          eq(appointment.patient_id, patient_id),
          eq(appointment.therapist_id, therapist_id),
        ),
      )
      .orderBy(desc(appointment.starts_at));
  }
}
