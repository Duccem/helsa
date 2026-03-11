import { DomainError } from "@/modules/shared/domain/domain-error";

export class MedicationNotFound extends DomainError {
  constructor(medicationId: string) {
    super({ medicationId });
  }

  get message(): string {
    return `Medication with ID ${this.params.medicationId} not found`;
  }
}

export class MedicationReminderNotFound extends DomainError {
  constructor(reminder_id: string) {
    super({ reminder_id });
  }

  get message(): string {
    return `Medication reminder with ID ${this.params.reminder_id} not found`;
  }
}

