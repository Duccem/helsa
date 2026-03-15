import { PrescriptionId } from "../domain/prescription";
import { PrescriptionNotFound } from "../domain/prescription-not-found";
import { PrescriptionRepository } from "../domain/prescription-repository";

export class UpdatePrescription {
  constructor(private readonly repository: PrescriptionRepository) {}

  async execute(prescription_id: string, observation: string): Promise<void> {
    const prescription = await this.repository.find(PrescriptionId.fromString(prescription_id));
    if (!prescription) {
      throw new PrescriptionNotFound(prescription_id);
    }

    prescription.update(observation);
    await this.repository.save(prescription);
  }
}

