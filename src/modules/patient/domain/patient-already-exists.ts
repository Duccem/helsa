import { DomainError } from "@/modules/shared/domain/domain-error";

export class PatientAlreadyExists extends DomainError {
  constructor(organizationId: string, email: string) {
    super({ organizationId, email });
  }

  get message(): string {
    return `Patient with email ${this.params.email} already exists in organization ${this.params.organizationId}`;
  }
}

