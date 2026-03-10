import { DomainError } from "@/modules/shared/domain/domain-error";

export class DoctorNotFound extends DomainError {
  constructor(doctorId: string) {
    super({ doctorId });
  }

  get message(): string {
    return `Doctor with ID ${this.params.doctorId} not found`;
  }
}

