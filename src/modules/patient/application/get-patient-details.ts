import { ApplicationService } from "@/modules/shared/domain/service.";
import { PatientId } from "../domain/patient";
import { PatientNotFound } from "../domain/patient-not-found";
import { PatientRepository } from "../domain/patient-repository";

@ApplicationService()
export class GetPatientDetails {
  constructor(private readonly repository: PatientRepository) {}

  async execute(patientId: string) {
    const patient = await this.repository.find(PatientId.fromString(patientId));
    if (!patient) {
      throw new PatientNotFound(patientId);
    }

    return patient.toPrimitives();
  }
}

