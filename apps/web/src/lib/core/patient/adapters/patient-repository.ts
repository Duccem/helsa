import { and, asc, eq, isNull, sql } from "@helsa/db/operators";
import { appointment } from "@helsa/db/schema/appointment";
import { patient } from "@helsa/db/schema/patient";
import { db } from "@/services";
import type { NewPatient, Patient } from "../domain/types";

// Per-patient figures for the list, computed in the same query. Written with
// explicit aliases: inside sql`` drizzle renders columns without their table,
// which makes "id" ambiguous in a correlated subquery.
const nextAppointmentAt = sql`(
  select min(a.starts_at) from appointment a
  where a.patient_id = "patient"."id"
    and a.status in ('scheduled', 'confirmed')
    and a.ends_at > now()
)`.mapWith(appointment.starts_at);

const lastSessionAt = sql`(
  select max(a.starts_at) from appointment a
  where a.patient_id = "patient"."id"
    and a.status not in ('cancelled', 'no_show')
    and a.ends_at <= now()
)`.mapWith(appointment.starts_at);

const sessionsCount = sql<number>`(
  select count(*)::int from appointment a
  where a.patient_id = "patient"."id"
    and a.status not in ('cancelled', 'no_show')
    and a.ends_at <= now()
)`.mapWith(Number);

const openTasksCount = sql<number>`(
  select count(*)::int from patient_task t
  where t.patient_id = "patient"."id"
    and t.status = 'assigned'
)`.mapWith(Number);

const unseenEntriesCount = sql<number>`(
  select count(*)::int from task_entry e
  inner join patient_task t on t.id = e.task_id
  where t.patient_id = "patient"."id"
    and e.seen_by_therapist_at is null
)`.mapWith(Number);

export class PatientRepository {
  async list(therapist_id: string) {
    return db
      .select({
        id: patient.id,
        first_name: patient.first_name,
        last_name: patient.last_name,
        preferred_name: patient.preferred_name,
        email: patient.email,
        phone_e164: patient.phone_e164,
        city: patient.city,
        status: patient.status,
        created_at: patient.created_at,
        next_appointment_at: nextAppointmentAt,
        last_session_at: lastSessionAt,
        sessions: sessionsCount,
        open_tasks: openTasksCount,
        unseen_entries: unseenEntriesCount,
      })
      .from(patient)
      .where(and(eq(patient.therapist_id, therapist_id), isNull(patient.deleted_at)))
      .orderBy(asc(patient.first_name), asc(patient.last_name));
  }

  async getById(id: string, therapist_id: string) {
    const [response] = await db
      .select()
      .from(patient)
      .where(
        and(
          eq(patient.id, id),
          eq(patient.therapist_id, therapist_id),
          isNull(patient.deleted_at),
        ),
      )
      .limit(1);

    return response;
  }

  async create(data: NewPatient) {
    await db.insert(patient).values(data);
  }

  async update(data: Patient) {
    await db
      .update(patient)
      .set(data)
      .where(and(eq(patient.id, data.id), eq(patient.therapist_id, data.therapist_id)));
  }
}
