import { PaginatedResult } from "@/modules/shared/domain/query";
import { Doctor } from "../domain/doctor";
import { DoctorRepository, DoctorSearchCriteria } from "../domain/doctor-repository";
import { ApplicationService } from "@/modules/shared/domain/service.";

@ApplicationService()
export class SearchDoctors {
  constructor(private readonly repository: DoctorRepository) {}

  async execute(criteria: DoctorSearchCriteria): Promise<PaginatedResult<Doctor>> {
    return await this.repository.search(criteria);
  }
}

