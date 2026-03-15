import { DomainError } from "@/modules/shared/domain/domain-error";

export class PatientAlreadyExists extends DomainError {
  constructor(email: string) {
    super({ email });
  }

  get message(): string {
    return `Patient with email ${this.params.email} already exists `;
  }
}

