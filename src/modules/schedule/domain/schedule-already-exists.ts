import { DomainError } from "@/modules/shared/domain/domain-error";

export class ScheduleAlreadyExists extends DomainError {
  constructor(doctorId: string) {
    super({ doctorId });
  }

  get message(): string {
    return `Schedule for doctor with ID ${this.params.doctorId} already exists`;
  }
}

