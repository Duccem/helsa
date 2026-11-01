import { randomUUID } from "node:crypto";
import type { BetterUser } from "@helsa/auth";
import type { PatientInput } from "@/components/dashboard/patients/schema";
import { assertTherapistRole } from "../../therapist/domain/guards";
import { EnsureTherapist } from "../../therapist/use-cases/ensure-therapist";
import { PatientRepository } from "../adapters/patient-repository";
import { toPatientColumns } from "../domain/mappers";

type CreatePatientInput = PatientInput;

export class CreatePatient {
  private repository = new PatientRepository();
  private ensurer = new EnsureTherapist();

  async execute(data: CreatePatientInput, user: BetterUser) {
    assertTherapistRole(user);
    await this.ensurer.execute(user);

    const id = randomUUID();
    await this.repository.create({
      id,
      therapist_id: user.id,
      ...toPatientColumns(data, user.id),
      discharged_at: data.status === "discharged" ? new Date() : null,
    });

    return { id };
  }
}
