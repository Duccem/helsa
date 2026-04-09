import { PatientUserId } from "../domain/patient";
import { PatientNotFound } from "../domain/patient-not-found";
import { PatientRepository } from "../domain/patient-repository";

export class GetPatientProfile {
  constructor(private readonly repository: PatientRepository) {}

  async execute(userId: string) {
    const patient = await this.repository.findByUserId(PatientUserId.fromString(userId));

    if (!patient) {
      throw new PatientNotFound(userId);
    }

    return patient.toPrimitives();
  }
}

