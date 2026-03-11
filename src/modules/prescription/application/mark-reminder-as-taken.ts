import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { PrescriptionId } from "../domain/prescription";
import { PrescriptionNotFound } from "../domain/prescription-not-found";
import { PrescriptionRepository } from "../domain/prescription-repository";

export class MarkReminderAsTaken {
  constructor(private readonly repository: PrescriptionRepository) {}

  async execute(prescription_id: string, reminder_id: string, organization_id: string): Promise<void> {
    const prescription = await this.repository.find(PrescriptionId.fromString(prescription_id));
    if (!prescription) {
      throw new PrescriptionNotFound(prescription_id);
    }

    if (prescription.organization_id.getValue() !== organization_id) {
      throw new NotAuthorized("You are not authorized to update this prescription.");
    }

    prescription.markReminderAsTaken(reminder_id);
    await this.repository.save(prescription);
  }
}

