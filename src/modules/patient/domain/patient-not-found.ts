import { DomainError } from "@/modules/shared/domain/domain-error";

export class PatientNotFound extends DomainError {
  constructor(patientId: string) {
    super({ patientId });
  }

  get message(): string {
    return `Patient with ID ${this.params.patientId} not found`;
  }
}

