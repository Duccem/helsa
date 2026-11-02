import { TaskRepository } from "../adapters/task-repository";

/** Patient answers waiting for review, shown as the sidebar badge of the tasks page. */
export class CountUnseenEntries {
  private repository = new TaskRepository();

  async execute(therapist_id: string) {
    return this.repository.countUnseenEntries(therapist_id);
  }
}
