import { and, desc, eq, isNull, sql } from "@helsa/db/operators";
import { appointment } from "@helsa/db/schema/appointment";
import { session_note } from "@helsa/db/schema/note";
import { patient } from "@helsa/db/schema/patient";
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

  /** Every note of the therapist, newest first, with its patient and session. */
  async listByTherapist(therapist_id: string) {
    return db
      .select({
        note: session_note,
        first_name: patient.first_name,
        last_name: patient.last_name,
        preferred_name: patient.preferred_name,
        patient_status: patient.status,
        session_starts_at: appointment.starts_at,
      })
      .from(session_note)
      .innerJoin(patient, eq(patient.id, session_note.patient_id))
      .leftJoin(appointment, eq(appointment.id, session_note.appointment_id))
      .where(
        and(
          eq(session_note.therapist_id, therapist_id),
          isNull(session_note.deleted_at),
          isNull(patient.deleted_at),
        ),
      )
      .orderBy(desc(session_note.created_at));
  }

  /** Drafts waiting for a signature, for the sidebar badge. */
  async countDrafts(therapist_id: string) {
    const [response] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(session_note)
      .innerJoin(patient, eq(patient.id, session_note.patient_id))
      .where(
        and(
          eq(session_note.therapist_id, therapist_id),
          isNull(session_note.deleted_at),
          isNull(session_note.signed_at),
          isNull(patient.deleted_at),
        ),
      );

    return response?.count ?? 0;
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
