import { ApplicationService } from "@/modules/shared/domain/service.";
import { MedicationId } from "../domain/medication";
import { PrescriptionId } from "../domain/prescription";
import { PrescriptionNotFound } from "../domain/prescription-not-found";
import { PrescriptionRepository } from "../domain/prescription-repository";

@ApplicationService()
export class GetPrescriptionDetailsSystem {
  constructor(private readonly repository: PrescriptionRepository) {}

  async execute(prescription_id: string) {
    const id = PrescriptionId.fromString(prescription_id);
    const prescription = await this.repository.find(id);
    if (!prescription) {
      throw new PrescriptionNotFound(prescription_id);
    }

    return prescription.toPrimitives();
  }
}

