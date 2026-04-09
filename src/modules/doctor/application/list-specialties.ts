import { SpecialtyRepository } from "../domain/doctor-repository";
import { Specialty } from "../domain/specialty";

export class ListSpecialties {
  constructor(private readonly repository: SpecialtyRepository) {}

  async execute(name?: string): Promise<Specialty[]> {
    return await this.repository.search(name);
  }
}

