import { PaginatedResult } from "@/modules/shared/domain/query";
import { Medication } from "../domain/medication";
import { MedicationSearchCriteria, PrescriptionRepository } from "../domain/prescription-repository";

export class SearchMedications {
  constructor(private readonly repository: PrescriptionRepository) {}

  async execute(criteria: MedicationSearchCriteria): Promise<PaginatedResult<Medication>> {
    return await this.repository.searchMedications(criteria);
  }
}

