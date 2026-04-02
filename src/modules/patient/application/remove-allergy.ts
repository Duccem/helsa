import { PatientId } from "../domain/patient";
import { PatientNotFound } from "../domain/patient-not-found";
import { PatientRepository } from "../domain/patient-repository";

export class RemoveAllergy {
  constructor(private readonly repository: PatientRepository) {}

  async execute(params: { patient_id: string; allergy_id: string }): Promise<void> {
    const patient = await this.repository.find(PatientId.fromString(params.patient_id));
    if (!patient) {
      throw new PatientNotFound(params.patient_id);
    }

    patient.removeAllergy(params.allergy_id);

    await this.repository.save(patient);
  }
}
