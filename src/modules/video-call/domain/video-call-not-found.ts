import { DomainError } from "@/modules/shared/domain/domain-error";

export class VideoCallNotFound extends DomainError {
  constructor(appointmentId: string) {
    super({ appointmentId });
  }

  get message(): string {
    return `Video call for appointment with ID ${this.params.appointmentId} not found`;
  }
}
