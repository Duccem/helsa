import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { MedicationAlternativeDrug, MedicationStateValues, PrescriptionId } from "../domain/prescription";
import { PrescriptionNotFound } from "../domain/prescription-not-found";
import { PrescriptionRepository } from "../domain/prescription-repository";

export class UpdateMedication {
  constructor(private readonly repository: PrescriptionRepository) {}

  async execute(
    prescription_id: string,
    medication_id: string,
    organization_id: string,
    params: {
      name?: string;
      dosage?: number;
      dosage_unit?: string;
      frequency?: string;
      administration_method?: string;
      alternatives?: MedicationAlternativeDrug[];
      start_date?: Date;
      end_date?: Date | null;
      notes?: string | null;
      state?: MedicationStateValues;
    },
  ): Promise<void> {
    const prescription = await this.repository.find(PrescriptionId.fromString(prescription_id));
    if (!prescription) {
      throw new PrescriptionNotFound(prescription_id);
    }

    if (prescription.organization_id.getValue() !== organization_id) {
      throw new NotAuthorized("You are not authorized to update this medication.");
    }

    prescription.updateMedication(medication_id, params);
    await this.repository.save(prescription);
  }
}

