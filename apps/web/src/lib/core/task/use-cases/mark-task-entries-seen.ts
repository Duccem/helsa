import type { BetterUser } from "@helsa/auth";
import { TaskRepository } from "../adapters/task-repository";
import { EnsurePatientTask } from "./ensure-patient-task";

/** The therapist read the patient's answers to this task. */
export class MarkTaskEntriesSeen {
  private repository = new TaskRepository();
  private ensurer = new EnsurePatientTask();

  async execute(data: { patientId: string; taskId: string }, user: BetterUser) {
    const task = await this.ensurer.execute(data, user);

    await this.repository.markEntriesSeen(task.id);
  }
}
