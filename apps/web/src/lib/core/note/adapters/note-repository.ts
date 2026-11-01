import { and, desc, eq, isNull } from "@helsa/db/operators";
import { session_note } from "@helsa/db/schema/note";
import { db } from "@/services";
import type { NewSessionNote, SessionNote } from "../domain/types";

export class NoteRepository {
  async listByPatient(patient_id: string, therapist_id: string) {
    return db
      .select()
      .from(session_note)
      .where(
        and(
          eq(session_note.patient_id, patient_id),
          eq(session_note.therapist_id, therapist_id),
          isNull(session_note.deleted_at),
        ),
      )
      .orderBy(desc(session_note.created_at));
  }

  async getById(id: string, therapist_id: string) {
    const [response] = await db
      .select()
      .from(session_note)
      .where(
        and(
          eq(session_note.id, id),
          eq(session_note.therapist_id, therapist_id),
          isNull(session_note.deleted_at),
        ),
      )
      .limit(1);

    return response;
  }

  async create(data: NewSessionNote) {
    await db.insert(session_note).values(data);
  }

  async update(data: SessionNote) {
    await db
      .update(session_note)
      .set(data)
      .where(and(eq(session_note.id, data.id), eq(session_note.therapist_id, data.therapist_id)));
  }
}
