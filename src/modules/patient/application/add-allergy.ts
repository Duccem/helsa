import { ApplicationService } from "@/modules/shared/domain/service.";
import { PatientId } from "../domain/patient";
import { PatientNotFound } from "../domain/patient-not-found";
import { PatientRepository } from "../domain/patient-repository";

@ApplicationService()
export class AddAllergy {
  constructor(private readonly repository: PatientRepository) {}

  async execute(params: { patient_id: string; name: string; severity?: string; notes?: string }): Promise<void> {
    const patient = await this.repository.find(PatientId.fromString(params.patient_id));
    if (!patient) {
      throw new PatientNotFound(params.patient_id);
    }

    patient.addAllergy({
      name: params.name,
      severity: params.severity,
      notes: params.notes,
    });

    await this.repository.save(patient);
  }
}

