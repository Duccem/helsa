import { PatientAlreadyExists } from "../domain/patient-already-exists";
import { PatientId, PatientGenderValues } from "../domain/patient";
import { PatientNotFound } from "../domain/patient-not-found";
import { PatientRepository } from "../domain/patient-repository";
import { ApplicationService } from "@/modules/shared/domain/service.";

@ApplicationService()
export class UpdatePatient {
  constructor(private readonly repository: PatientRepository) {}

  async execute(params: {
    patient_id: string;
    email?: string;
    name: string;
    birth_date: Date;
    gender?: PatientGenderValues;
  }): Promise<void> {
    const patient = await this.repository.find(PatientId.fromString(params.patient_id));
    if (!patient) {
      throw new PatientNotFound(params.patient_id);
    }

    if (params.email && params.email !== patient.email.value) {
      const existing = await this.repository.findByEmail(params.email);
      if (existing && existing.id.value !== patient.id.value) {
        throw new PatientAlreadyExists(params.email);
      }
    }

    patient.update({
      email: params.email,
      name: params.name,
      birth_date: params.birth_date,
      gender: params.gender,
    });

    await this.repository.save(patient);
  }
}

