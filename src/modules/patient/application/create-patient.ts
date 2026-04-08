import { PatientAlreadyExists } from "../domain/patient-already-exists";
import { Patient, PatientGenderValues } from "../domain/patient";
import { PatientRepository } from "../domain/patient-repository";
import { ApplicationService } from "@/modules/shared/domain/service.";

@ApplicationService()
export class CreatePatient {
  constructor(private readonly repository: PatientRepository) {}

  async execute(params: {
    user_id: string;
    email: string;
    name: string;
    birth_date: Date;
    gender?: PatientGenderValues;
    contact_info?: Array<{ phone?: string; address?: string }>;
  }): Promise<void> {
    const existing = await this.repository.findByEmail(params.email);
    if (existing) {
      throw new PatientAlreadyExists(params.email);
    }

    const patient = Patient.create(params.user_id, params.email, params.name, params.birth_date, params.gender);

    if (params.contact_info) {
      for (const contactInfo of params.contact_info) {
        patient.addContactInfo(contactInfo);
      }
    }

    await this.repository.save(patient);
  }
}

