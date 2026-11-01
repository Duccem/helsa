import type { BetterUser } from "@helsa/auth";
import type { NoteInput } from "@/components/dashboard/patients/schema";
import { CURRENT_KEY_VERSION, encryptText } from "@/lib/infra/clinical-cipher";
import { NoteRepository } from "../adapters/note-repository";
import type { SessionNote } from "../domain/types";
import { EnsureEditableNote } from "./ensure-editable-note";

type UpdateNoteInput = NoteInput & { patientId: string; noteId: string };

export class UpdateNote {
  private repository = new NoteRepository();
  private ensurer = new EnsureEditableNote();

  async execute(data: UpdateNoteInput, user: BetterUser) {
    const note = await this.ensurer.execute(data, user);

    await this.repository.update(this.updateNoteData(data, note, user.id));
  }

  private updateNoteData(data: NoteInput, note: SessionNote, therapist_id: string) {
    return {
      ...note,
      title: data.title.trim() || null,
      content_enc: encryptText(data.content, therapist_id),
      enc_key_version: CURRENT_KEY_VERSION,
      version: note.version + 1,
      client_updated_at: new Date(),
    };
  }
}
