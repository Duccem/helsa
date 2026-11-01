import type { BetterUser } from "@helsa/auth";
import { NoteRepository } from "../adapters/note-repository";
import { EnsureEditableNote } from "./ensure-editable-note";

/** Drafts can be deleted; signed notes are part of the record and stay. */
export class DeleteNote {
  private repository = new NoteRepository();
  private ensurer = new EnsureEditableNote();

  async execute(data: { patientId: string; noteId: string }, user: BetterUser) {
    const note = await this.ensurer.execute(data, user);

    await this.repository.update({ ...note, deleted_at: new Date() });
  }
}
