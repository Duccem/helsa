import type { BetterUser } from "@helsa/auth";
import { TaskRepository } from "../adapters/task-repository";
import { TaskNotActive } from "../domain/errors";
import { EnsurePatientTask } from "./ensure-patient-task";

export class CancelTask {
  private repository = new TaskRepository();
  private ensurer = new EnsurePatientTask();

  async execute(data: { patientId: string; taskId: string }, user: BetterUser) {
    const task = await this.ensurer.execute(data, user);

    if (task.status !== "assigned") {
      throw new TaskNotActive();
    }

    await this.repository.update({ ...task, status: "cancelled" });
  }
}
