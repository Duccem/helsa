import { PrescriptionId } from "../domain/prescription";
import { PrescriptionNotFound } from "../domain/prescription-not-found";
import { PrescriptionRepository } from "../domain/prescription-repository";

export class MarkRemindersAsForgotten {
  constructor(private readonly repository: PrescriptionRepository) {}

  async execute(prescription_id: string, medication_id: string, reminder_id: string): Promise<void> {
    const prescription = await this.repository.find(PrescriptionId.fromString(prescription_id));
    if (!prescription) {
      throw new PrescriptionNotFound(prescription_id);
    }

    prescription.markMedicationAsForgotten(medication_id, reminder_id);
    await this.repository.save(prescription);
  }
}

