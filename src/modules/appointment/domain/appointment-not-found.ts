import { DomainError } from "@/modules/shared/domain/domain-error";

export class AppointmentNotFound extends DomainError {
  constructor(appointmentId: string) {
    super({ appointmentId });
  }

  get message(): string {
    return `Appointment with ID ${this.params.appointmentId} not found`;
  }
}
