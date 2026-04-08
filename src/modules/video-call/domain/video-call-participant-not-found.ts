import { DomainError } from "@/modules/shared/domain/domain-error";

export class VideoCallParticipantNotFound extends DomainError {
  constructor(participant: "doctor" | "patient", appointmentId: string) {
    super({ participant, appointmentId });
  }

  get message(): string {
    return `${this.params.participant} for appointment with ID ${this.params.appointmentId} not found in video call`;
  }
}
