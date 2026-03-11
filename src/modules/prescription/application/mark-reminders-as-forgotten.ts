import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { PrescriptionId } from "../domain/prescription";
import { PrescriptionNotFound } from "../domain/prescription-not-found";
import { PrescriptionRepository } from "../domain/prescription-repository";

export class MarkRemindersAsForgotten {
  constructor(private readonly repository: PrescriptionRepository) {}

  async execute(prescription_id: string, reminder_ids: string[], organization_id: string): Promise<void> {
    const prescription = await this.repository.find(PrescriptionId.fromString(prescription_id));
    if (!prescription) {
      throw new PrescriptionNotFound(prescription_id);
    }

    if (prescription.organization_id.getValue() !== organization_id) {
      throw new NotAuthorized("You are not authorized to update this prescription.");
    }

    prescription.markRemindersAsForgotten(reminder_ids);
    await this.repository.save(prescription);
  }
}

