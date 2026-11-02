import { and, desc, eq, gte, inArray, isNull, sql } from "@helsa/db/operators";
import { patient } from "@helsa/db/schema/patient";
import { patient_task, task_entry } from "@helsa/db/schema/task";
import { db } from "@/services";
import type { NewPatientTask, PatientTask } from "../domain/types";

export class TaskRepository {
  async listByPatient(patient_id: string, therapist_id: string) {
    return db
      .select()
      .from(patient_task)
      .where(and(eq(patient_task.patient_id, patient_id), eq(patient_task.therapist_id, therapist_id)))
      .orderBy(desc(patient_task.created_at));
  }

  /** Every task of the therapist, newest first, with its patient's name. */
  async listByTherapist(therapist_id: string) {
    return db
      .select({
        task: patient_task,
        first_name: patient.first_name,
        last_name: patient.last_name,
        preferred_name: patient.preferred_name,
      })
      .from(patient_task)
      .innerJoin(patient, eq(patient.id, patient_task.patient_id))
      .where(and(eq(patient_task.therapist_id, therapist_id), isNull(patient.deleted_at)))
      .orderBy(desc(patient_task.created_at));
  }

  /** Patient answers the therapist hasn't read yet, for the sidebar badge. */
  async countUnseenEntries(therapist_id: string) {
    const [response] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(task_entry)
      .innerJoin(patient_task, eq(patient_task.id, task_entry.task_id))
      .innerJoin(patient, eq(patient.id, patient_task.patient_id))
      .where(
        and(
          eq(patient_task.therapist_id, therapist_id),
          isNull(task_entry.seen_by_therapist_at),
          isNull(patient.deleted_at),
        ),
      );

    return response?.count ?? 0;
  }

  async getEntries(task_ids: string[]) {
    if (task_ids.length === 0) return [];
    return db
      .select()
      .from(task_entry)
      .where(inArray(task_entry.task_id, task_ids))
      .orderBy(desc(task_entry.entry_date), desc(task_entry.created_at));
  }

  /**
   * Answers from `from_day` on, without their (encrypted) text, with the task
   * and patient they belong to. Newest first.
   */
  async getEntriesSince(therapist_id: string, from_day: string) {
    return db
      .select({
        id: task_entry.id,
        task_id: task_entry.task_id,
        entry_date: task_entry.entry_date,
        mood_score: task_entry.mood_score,
        seen: sql<boolean>`${task_entry.seen_by_therapist_at} is not null`,
        created_at: task_entry.created_at,
        task_title: patient_task.title,
        task_status: patient_task.status,
        asks_mood: patient_task.asks_mood,
        patient_id: patient.id,
        first_name: patient.first_name,
        last_name: patient.last_name,
        preferred_name: patient.preferred_name,
      })
      .from(task_entry)
      .innerJoin(patient_task, eq(patient_task.id, task_entry.task_id))
      .innerJoin(patient, eq(patient.id, patient_task.patient_id))
      .where(
        and(
          eq(patient_task.therapist_id, therapist_id),
          gte(task_entry.entry_date, from_day),
          isNull(patient.deleted_at),
        ),
      )
      .orderBy(desc(task_entry.entry_date), desc(task_entry.created_at));
  }

  async getById(id: string, therapist_id: string) {
    const [response] = await db
      .select()
      .from(patient_task)
      .where(and(eq(patient_task.id, id), eq(patient_task.therapist_id, therapist_id)))
      .limit(1);

    return response;
  }

  async create(data: NewPatientTask) {
    await db.insert(patient_task).values(data);
  }

  async update(data: PatientTask) {
    await db
      .update(patient_task)
      .set(data)
      .where(and(eq(patient_task.id, data.id), eq(patient_task.therapist_id, data.therapist_id)));
  }

  async markEntriesSeen(task_id: string) {
    await db
      .update(task_entry)
      .set({ seen_by_therapist_at: new Date() })
      .where(and(eq(task_entry.task_id, task_id), isNull(task_entry.seen_by_therapist_at)));
  }
}
