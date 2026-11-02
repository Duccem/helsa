import { NoteRepository } from "../adapters/note-repository";

/** Notes still in draft, shown as the sidebar badge of the notes page. */
export class CountDraftNotes {
  private repository = new NoteRepository();

  async execute(therapist_id: string) {
    return this.repository.countDrafts(therapist_id);
  }
}
