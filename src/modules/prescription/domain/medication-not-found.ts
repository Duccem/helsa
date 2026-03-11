import { DomainError } from "@/modules/shared/domain/domain-error";

export class MedicationNotFound extends DomainError {
  constructor(medicationId: string) {
    super({ medicationId });
  }

  get message(): string {
    return `Medication with ID ${this.params.medicationId} not found`;
  }
}

