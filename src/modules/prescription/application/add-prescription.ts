import { Prescription } from "../domain/prescription";
import { PrescriptionRepository } from "../domain/prescription-repository";

export class AddPrescription {
  constructor(private readonly repository: PrescriptionRepository) {}

  async execute(patient_id: string, doctor_id: string, organization_id: string, observation: string): Promise<void> {
    const prescription = Prescription.create({
      patient_id,
      doctor_id,
      organization_id,
      observation,
    });

    await this.repository.save(prescription);
  }
}

