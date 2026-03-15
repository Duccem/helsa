import { DomainError } from "@/modules/shared/domain/domain-error";

export class InvalidRole extends DomainError {
  constructor(role: string) {
    super({ role });
  }

  get message(): string {
    return `The role ${this.params.role} is invalid.`;
  }
}
