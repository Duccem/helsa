import { ApplicationService } from "@/modules/shared/domain/service.";
import { PatientId } from "../domain/patient";
import { PatientNotFound } from "../domain/patient-not-found";
import { PatientRepository } from "../domain/patient-repository";

@ApplicationService()
export class AddContactInfo {
  constructor(private readonly repository: PatientRepository) {}

  async execute(params: { patient_id: string; phone?: string; address?: string }): Promise<void> {
    const patient = await this.repository.find(PatientId.fromString(params.patient_id));
    if (!patient) {
      throw new PatientNotFound(params.patient_id);
    }

    patient.addContactInfo({
      phone: params.phone,
      address: params.address,
    });

    await this.repository.save(patient);
  }
}

