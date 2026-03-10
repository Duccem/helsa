import { DomainError } from "@/modules/shared/domain/domain-error";

export class AppointmentAlreadyHasRating extends DomainError {
  constructor({ appointmentId }: { appointmentId: string }) {
    super({ appointmentId });
  }

  get message(): string {
    return `The appointment with id ${this.params.appointmentId} already has a rating.`;
  }
}
