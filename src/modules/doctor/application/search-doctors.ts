import { PaginatedResult } from "@/modules/shared/domain/query";
import { Doctor } from "../domain/doctor";
import { DoctorRepository, DoctorSearchCriteria } from "../domain/doctor-repository";

export class SearchDoctors {
  constructor(private readonly repository: DoctorRepository) {}

  async execute(criteria: DoctorSearchCriteria): Promise<PaginatedResult<Doctor>> {
    return await this.repository.search(criteria);
  }
}

