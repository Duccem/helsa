import { randomUUID } from "node:crypto";
import type { BetterUser } from "@helsa/auth";
import type { TaskInput } from "@/components/dashboard/patients/schema";
import { EnsurePatientAccess } from "../../patient/use-cases/ensure-patient-access";
import { TaskRepository } from "../adapters/task-repository";

type AssignTaskInput = TaskInput & { patientId: string };

export class AssignTask {
  private repository = new TaskRepository();
  private access = new EnsurePatientAccess();

  async execute(data: AssignTaskInput, user: BetterUser) {
    const patient = await this.access.execute(data.patientId, user);
    const id = randomUUID();

    await this.repository.create({
      id,
      therapist_id: user.id,
      patient_id: patient.id,
      title: data.title.trim(),
      instructions: data.instructions.trim() || null,
      frequency: data.frequency,
      starts_on: data.startsOn,
      due_on: data.dueOn || null,
      asks_mood: data.asksMood,
    });

    return { id };
  }
}
