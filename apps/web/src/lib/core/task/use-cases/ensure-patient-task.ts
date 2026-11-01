import type { BetterUser } from "@helsa/auth";
import { isUuid } from "@/lib/utils/is-uuid";
import { EnsurePatientAccess } from "../../patient/use-cases/ensure-patient-access";
import { TaskRepository } from "../adapters/task-repository";
import { TaskNotFound } from "../domain/errors";

/** The task, if it belongs to this patient and therapist. */
export class EnsurePatientTask {
  private repository = new TaskRepository();
  private access = new EnsurePatientAccess();

  async execute(data: { patientId: string; taskId: string }, user: BetterUser) {
    const patient = await this.access.execute(data.patientId, user);

    if (!isUuid(data.taskId)) {
      throw new TaskNotFound();
    }
    const task = await this.repository.getById(data.taskId, user.id);

    if (!task || task.patient_id !== patient.id) {
      throw new TaskNotFound();
    }

    return task;
  }
}
