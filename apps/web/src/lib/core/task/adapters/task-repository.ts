import { and, desc, eq, inArray, isNull } from "@helsa/db/operators";
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

  async getEntries(task_ids: string[]) {
    if (task_ids.length === 0) return [];
    return db
      .select()
      .from(task_entry)
      .where(inArray(task_entry.task_id, task_ids))
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
