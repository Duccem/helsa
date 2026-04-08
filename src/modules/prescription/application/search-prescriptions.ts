import { PaginatedResult } from "@/modules/shared/domain/query";
import { Prescription } from "../domain/prescription";
import { PrescriptionRepository, PrescriptionSearchCriteria } from "../domain/prescription-repository";
import { ApplicationService } from "@/modules/shared/domain/service.";

@ApplicationService()
export class SearchPrescriptions {
  constructor(private readonly repository: PrescriptionRepository) {}

  async execute(criteria: PrescriptionSearchCriteria): Promise<PaginatedResult<Prescription>> {
    return await this.repository.search(criteria);
  }
}

