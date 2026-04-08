import { ApplicationService } from "@/modules/shared/domain/service.";
import { Prescription } from "../domain/prescription";
import { PrescriptionRepository } from "../domain/prescription-repository";

@ApplicationService()
export class AddPrescription {
  constructor(private readonly repository: PrescriptionRepository) {}

  async execute(patient_id: string, doctor_id: string, observation: string): Promise<void> {
    const prescription = Prescription.create({
      patient_id,
      doctor_id,
      observation,
    });

    await this.repository.save(prescription);
  }
}

