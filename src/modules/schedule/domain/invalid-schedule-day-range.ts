import { DomainError } from "@/modules/shared/domain/domain-error";

export class InvalidScheduleDayRange extends DomainError {
  constructor(day: number, startHour: string, endHour: string) {
    super({ day, startHour, endHour });
  }

  get message(): string {
    return `Invalid schedule day range for day ${this.params.day}: ${this.params.startHour} must be earlier than ${this.params.endHour}`;
  }
}
