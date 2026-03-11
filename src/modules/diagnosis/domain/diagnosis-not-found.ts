import { DomainError } from "@/modules/shared/domain/domain-error";

export class DiagnosisNotFound extends DomainError {
  constructor(diagnosisId: string) {
    super({ diagnosisId });
  }

  get message(): string {
    return `Diagnosis with ID ${this.params.diagnosisId} not found`;
  }
}

