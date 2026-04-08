import { DomainError } from "@/modules/shared/domain/domain-error";

export class VideoCallAlreadyExists extends DomainError {
  constructor(appointmentId: string) {
    super({ appointmentId });
  }

  get message(): string {
    return `Video call for appointment with ID ${this.params.appointmentId} already exists`;
  }
}
