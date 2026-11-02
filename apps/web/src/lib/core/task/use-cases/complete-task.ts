import type { BetterUser } from "@helsa/auth";
import { TaskRepository } from "../adapters/task-repository";
import { TaskNotActive } from "../domain/errors";
import { EnsurePatientTask } from "./ensure-patient-task";

/** The therapist closes a task as done. Answers stay; the patient stops seeing it. */
export class CompleteTask {
  private repository = new TaskRepository();
  private ensurer = new EnsurePatientTask();

  async execute(data: { patientId: string; taskId: string }, user: BetterUser) {
    const task = await this.ensurer.execute(data, user);

    if (task.status !== "assigned") {
      throw new TaskNotActive();
    }

    await this.repository.update({ ...task, status: "completed", completed_at: new Date() });
  }
}
