import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { PrescriptionId } from "../domain/prescription";
import { PrescriptionNotFound } from "../domain/prescription-not-found";
import { PrescriptionRepository } from "../domain/prescription-repository";
import { ApplicationService } from "@/modules/shared/domain/service.";

@ApplicationService()
export class MarkReminderAsTaken {
  constructor(private readonly repository: PrescriptionRepository) {}

  async execute(prescription_id: string, reminder_id: string, medication_id: string): Promise<void> {
    const prescription = await this.repository.find(PrescriptionId.fromString(prescription_id));
    if (!prescription) {
      throw new PrescriptionNotFound(prescription_id);
    }

    prescription.markMedicationAsTaken(medication_id, reminder_id);
    await this.repository.save(prescription);
  }
}

