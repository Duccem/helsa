import { PaginatedResult } from "@/modules/shared/domain/query";
import { Patient } from "../domain/patient";
import { PatientRepository, PatientSearchCriteria } from "../domain/patient-repository";

export class SearchPatients {
  constructor(private readonly repository: PatientRepository) {}

  async execute(criteria: PatientSearchCriteria): Promise<PaginatedResult<Patient>> {
    return await this.repository.search(criteria);
  }
}

