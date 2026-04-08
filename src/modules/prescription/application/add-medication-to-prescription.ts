import { PrescriptionId } from "../domain/prescription";
import { PrescriptionNotFound } from "../domain/prescription-not-found";
import { PrescriptionRepository } from "../domain/prescription-repository";
import { MedicationAlternativeDrug, MedicationStateValues } from "../domain/medication";
import { ApplicationService } from "@/modules/shared/domain/service.";

@ApplicationService()
export class AddMedicationToPrescription {
  constructor(private readonly repository: PrescriptionRepository) {}

  async execute(
    prescription_id: string,
    name: string,
    dosage: number,
    dosage_unit: string,
    frequency: string,
    administration_method: string,
    start_date: Date,
    alternatives?: MedicationAlternativeDrug[],
    end_date?: Date,
    notes?: string,
    state?: MedicationStateValues,
  ): Promise<void> {
    const prescription = await this.repository.find(PrescriptionId.fromString(prescription_id));
    if (!prescription) {
      throw new PrescriptionNotFound(prescription_id);
    }

    prescription.addMedication({
      name,
      dosage,
      dosage_unit,
      frequency,
      administration_method,
      alternatives,
      start_date,
      end_date,
      notes,
      state,
    });

    await this.repository.save(prescription);
  }
}

