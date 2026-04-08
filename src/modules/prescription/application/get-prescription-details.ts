import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { PrescriptionId } from "../domain/prescription";
import { PrescriptionNotFound } from "../domain/prescription-not-found";
import { PrescriptionRepository } from "../domain/prescription-repository";
import { ApplicationService } from "@/modules/shared/domain/service.";

@ApplicationService()
export class GetPrescriptionDetails {
  constructor(private readonly repository: PrescriptionRepository) {}

  async execute(prescription_id: string) {
    const prescription = await this.repository.find(PrescriptionId.fromString(prescription_id));
    if (!prescription) {
      throw new PrescriptionNotFound(prescription_id);
    }

    return prescription;
  }
}

