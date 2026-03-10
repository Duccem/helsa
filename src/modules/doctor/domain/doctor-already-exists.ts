import { DomainError } from "@/modules/shared/domain/domain-error";

export class DoctorAlreadyExists extends DomainError {
  constructor(userId: string) {
    super({ userId });
  }

  get message(): string {
    return `A doctor profile for user ${this.params.userId} already exists`;
  }
}

