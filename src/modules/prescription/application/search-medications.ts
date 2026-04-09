import { PaginatedResult } from "@/modules/shared/domain/query";
import { Medication } from "../domain/medication";
import { MedicationSearchCriteria, PrescriptionRepository } from "../domain/prescription-repository";
import { Primitives } from "@/modules/shared/domain/primitives";

export class SearchMedications {
  constructor(private readonly repository: PrescriptionRepository) {}

  async execute(criteria: MedicationSearchCriteria): Promise<PaginatedResult<Primitives<Medication>>> {
    const { data, pagination } = await this.repository.searchMedications(criteria);
    return {
      data: data.map((medication) => medication.toPrimitives()),
      pagination,
    };
  }
}

