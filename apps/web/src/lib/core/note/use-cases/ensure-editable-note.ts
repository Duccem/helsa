import type { BetterUser } from "@helsa/auth";
import { isUuid } from "@/lib/utils/is-uuid";
import { EnsurePatientAccess } from "../../patient/use-cases/ensure-patient-access";
import { NoteRepository } from "../adapters/note-repository";
import { NoteAlreadySigned, NoteNotFound } from "../domain/errors";

type NoteRef = { patientId: string; noteId: string };

/** The note, if it belongs to this patient and therapist and is not signed yet. */
export class EnsureEditableNote {
  private repository = new NoteRepository();
  private access = new EnsurePatientAccess();

  async execute(data: NoteRef, user: BetterUser) {
    const patient = await this.access.execute(data.patientId, user);

    if (!isUuid(data.noteId)) {
      throw new NoteNotFound();
    }
    const note = await this.repository.getById(data.noteId, user.id);

    if (!note || note.patient_id !== patient.id) {
      throw new NoteNotFound();
    }
    if (note.signed_at) {
      throw new NoteAlreadySigned();
    }

    return note;
  }
}
