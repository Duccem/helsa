import { DomainError } from "@/modules/shared/domain/domain-error";

export class AppointmentScheduledAtSameTime extends DomainError {
  constructor(doctorId: string, date: Date) {
    super({ doctorId, date });
  }

  get message(): string {
    return `Doctor with ID ${this.params.doctorId} already has an appointment scheduled at ${(this.params.date as Date).toISOString()}`;
  }
}

