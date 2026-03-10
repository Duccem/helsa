import { DomainError } from "@/modules/shared/domain/domain-error";

export class SpecialtyNotFound extends DomainError {
  constructor(specialtyId: string) {
    super({ specialtyId });
  }

  get message(): string {
    return `Specialty with ID ${this.params.specialtyId} not found`;
  }
}

