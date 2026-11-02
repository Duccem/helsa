import {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNull,
  lt,
  lte,
  notInArray,
  sql,
} from "@helsa/db/operators";
import { appointment } from "@helsa/db/schema/appointment";
import { patient } from "@helsa/db/schema/patient";
import { db } from "@/services";
import type { AppointmentStatus, NewAppointment } from "../domain/types";

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

  /** One appointment of the therapist, any status. */
  async getById(id: string, therapist_id: string) {
    const [response] = await db
      .select()
      .from(appointment)
      .where(and(eq(appointment.id, id), eq(appointment.therapist_id, therapist_id)))
      .limit(1);

    return response;
  }

  /**
   * Sessions that already happened in [from, to) and have no note yet,
   * newest first. Cancelled and no-show appointments don't need one.
   */
  async getEndedWithoutNote(therapist_id: string, from: Date, to: Date, limit: number) {
    return db
      .select(withPatient)
      .from(appointment)
      .innerJoin(patient, eq(patient.id, appointment.patient_id))
      .where(
        and(
          eq(appointment.therapist_id, therapist_id),
          gte(appointment.starts_at, from),
          lte(appointment.ends_at, to),
          notInArray(appointment.status, ["cancelled", "no_show"]),
          isNull(patient.deleted_at),
          // Explicit alias: inside sql`` drizzle drops the table from column names.
          sql`not exists (
            select 1 from session_note n
            where n.appointment_id = "appointment"."id"
              and n.deleted_at is null
          )`,
        ),
      )
      .orderBy(desc(appointment.starts_at))
      .limit(limit);
  }

  /** Time taken by active appointments that overlap [from, to). */
  async getBusyBetween(therapist_id: string, from: Date, to: Date) {
    return db
      .select({ starts_at: appointment.starts_at, ends_at: appointment.ends_at })
      .from(appointment)
      .where(
        and(
          eq(appointment.therapist_id, therapist_id),
          inArray(appointment.status, ["scheduled", "confirmed"]),
          lt(appointment.starts_at, to),
          gt(appointment.ends_at, from),
        ),
      );
  }

  /**
   * Inserts the appointment only if nothing active overlaps it (buffer
   * included). A per-therapist advisory lock makes two simultaneous bookings
   * of the same hour take turns, so only one of them wins.
   */
  async createIfFree(data: NewAppointment, buffer_minutes: number) {
    const margin = buffer_minutes * 60_000;
    const from = new Date(data.starts_at.getTime() - margin);
    const to = new Date(data.ends_at.getTime() + margin);

    return db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${data.therapist_id}))`);

      const [clash] = await tx
        .select({ id: appointment.id })
        .from(appointment)
        .where(
          and(
            eq(appointment.therapist_id, data.therapist_id),
            inArray(appointment.status, ["scheduled", "confirmed"]),
            lt(appointment.starts_at, to),
            gt(appointment.ends_at, from),
          ),
        )
        .limit(1);

      if (clash) return false;

      await tx.insert(appointment).values(data);
      return true;
    });
  }
}
