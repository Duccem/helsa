import type { BetterUser } from "@helsa/auth";
import { NoteRepository } from "../adapters/note-repository";
import { EnsureEditableNote } from "./ensure-editable-note";

/** Closes the note: from now on it can be read but not changed or deleted. */
export class SignNote {
  private repository = new NoteRepository();
  private ensurer = new EnsureEditableNote();

  async execute(data: { patientId: string; noteId: string }, user: BetterUser) {
    const note = await this.ensurer.execute(data, user);

    await this.repository.update({ ...note, signed_at: new Date() });
  }
}
