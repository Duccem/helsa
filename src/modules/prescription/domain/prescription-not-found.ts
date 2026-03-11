import { DomainError } from "@/modules/shared/domain/domain-error";

export class PrescriptionNotFound extends DomainError {
  constructor(prescriptionId: string) {
    super({ prescriptionId });
  }

  get message(): string {
    return `Prescription with ID ${this.params.prescriptionId} not found`;
  }
}

