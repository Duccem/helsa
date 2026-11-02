import type { BetterUser } from "@helsa/auth";
import type { TaskInput } from "@/components/dashboard/patients/schema";
import { TaskRepository } from "../adapters/task-repository";
import { TaskNotActive } from "../domain/errors";
import { EnsurePatientTask } from "./ensure-patient-task";

type UpdateTaskInput = TaskInput & { patientId: string; taskId: string };

/** Changes an active task. Finished tasks are part of the record and stay as they were. */
export class UpdateTask {
  private repository = new TaskRepository();
  private ensurer = new EnsurePatientTask();

  async execute(data: UpdateTaskInput, user: BetterUser) {
    const task = await this.ensurer.execute(data, user);

    if (task.status !== "assigned") {
      throw new TaskNotActive();
    }

    await this.repository.update({
      ...task,
      title: data.title.trim(),
      instructions: data.instructions.trim() || null,
      frequency: data.frequency,
      starts_on: data.startsOn,
      due_on: data.dueOn || null,
      asks_mood: data.asksMood,
    });
  }
}
