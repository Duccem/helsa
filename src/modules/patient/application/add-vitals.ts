import { ApplicationService } from "@/modules/shared/domain/service.";
import { PatientId } from "../domain/patient";
import { PatientNotFound } from "../domain/patient-not-found";
import { PatientRepository } from "../domain/patient-repository";

@ApplicationService()
export class AddVitals {
  constructor(private readonly repository: PatientRepository) {}

  async execute(params: {
    patient_id: string;
    blood_pressure?: number;
    heart_rate?: number;
    respiratory_rate?: number;
    oxygen_saturation?: number;
    temperature?: number;
  }): Promise<void> {
    const patient = await this.repository.find(PatientId.fromString(params.patient_id));
    if (!patient) {
      throw new PatientNotFound(params.patient_id);
    }

    patient.addVitals({
      blood_pressure: params.blood_pressure,
      heart_rate: params.heart_rate,
      respiratory_rate: params.respiratory_rate,
      oxygen_saturation: params.oxygen_saturation,
      temperature: params.temperature,
    });

    await this.repository.save(patient);
  }
}

