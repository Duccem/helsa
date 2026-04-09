import { PatientId } from "../domain/patient";
import { PatientNotFound } from "../domain/patient-not-found";
import { PatientRepository } from "../domain/patient-repository";

export class SetPhysicalInformation {
  constructor(private readonly repository: PatientRepository) {}

  async execute(params: {
    patient_id: string;
    height?: number;
    weight?: number;
    blood_type?: string;
    body_mass_index?: number;
  }): Promise<void> {
    const patient = await this.repository.find(PatientId.fromString(params.patient_id));
    if (!patient) {
      throw new PatientNotFound(params.patient_id);
    }

    patient.setPhysicalInformation({
      height: params.height,
      weight: params.weight,
      blood_type: params.blood_type,
      body_mass_index: params.body_mass_index,
    });

    await this.repository.save(patient);
  }
}

