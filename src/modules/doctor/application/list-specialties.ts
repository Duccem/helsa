import { ApplicationService } from "@/modules/shared/domain/service.";
import { SpecialtyRepository } from "../domain/doctor-repository";
import { Specialty } from "../domain/specialty";

@ApplicationService()
export class ListSpecialties {
  constructor(private readonly repository: SpecialtyRepository) {}

  async execute(name?: string): Promise<Specialty[]> {
    return await this.repository.search(name);
  }
}

