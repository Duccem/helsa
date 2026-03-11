import { Primitives } from "@/modules/shared/domain/primitives";
import { BooleanValueObject } from "@/modules/shared/domain/value-object";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";
import { MedicationReminderScheduleCalculator } from "./medication-reminder-schedule-calculator";

export class MedicationReminderId extends Uuid {}
export class MedicationReminderMedicationId extends Uuid {}
export class MedicationReminderPrescriptionId extends Uuid {}
export class MedicationReminderPatientId extends Uuid {}
export class MedicationReminderScheduledTime extends Timestamp {}
export class MedicationReminderTakenAt extends Timestamp {}
export class MedicationReminderCreatedAt extends Timestamp {}
export class MedicationReminderUpdatedAt extends Timestamp {}
export class MedicationReminderForgotten extends BooleanValueObject {
  static notForgotten(): MedicationReminderForgotten {
    return new MedicationReminderForgotten(false);
  }

  static forgotten(): MedicationReminderForgotten {
    return new MedicationReminderForgotten(true);
  }
}
export class MedicationReminderIsTaken extends BooleanValueObject {
  static notTaken(): MedicationReminderIsTaken {
    return new MedicationReminderIsTaken(false);
  }

  static taken(): MedicationReminderIsTaken {
    return new MedicationReminderIsTaken(true);
  }
}

export class MedicationReminder {
  constructor(
    public id: MedicationReminderId,
    public medication_id: MedicationReminderMedicationId,
    public prescription_id: MedicationReminderPrescriptionId,
    public patient_id: MedicationReminderPatientId,
    public scheduled_time: MedicationReminderScheduledTime,
    public is_taken: MedicationReminderIsTaken | null,
    public forgotten: MedicationReminderForgotten | null,
    public created_at: MedicationReminderCreatedAt,
    public updated_at: MedicationReminderUpdatedAt,
    public taken_at: MedicationReminderTakenAt | null = null,
  ) {}

  toPrimitives(): Primitives<MedicationReminder> {
    return {
      id: this.id.value,
      prescription_id: this.prescription_id.value,
      medication_id: this.medication_id.value,
      patient_id: this.patient_id.value,
      scheduled_time: this.scheduled_time.value,
      is_taken: this.is_taken ? this.is_taken.getValue() : null,
      forgotten: this.forgotten ? this.forgotten.getValue() : null,
      taken_at: this.taken_at ? this.taken_at.value : null,
      created_at: this.created_at.value,
      updated_at: this.updated_at.value,
    };
  }

  static fromPrimitives(primitives: Primitives<MedicationReminder>): MedicationReminder {
    return new MedicationReminder(
      MedicationReminderId.fromString(primitives.id),
      MedicationReminderMedicationId.fromString(primitives.medication_id),
      MedicationReminderPrescriptionId.fromString(primitives.prescription_id),
      MedicationReminderPatientId.fromString(primitives.patient_id),
      MedicationReminderScheduledTime.fromDate(primitives.scheduled_time),
      primitives.is_taken === null ? null : MedicationReminderIsTaken.fromBoolean(primitives.is_taken),
      primitives.forgotten === null ? null : MedicationReminderForgotten.fromBoolean(primitives.forgotten),
      MedicationReminderCreatedAt.fromDate(primitives.created_at),
      MedicationReminderUpdatedAt.fromDate(primitives.updated_at),
      primitives.taken_at ? MedicationReminderTakenAt.fromDate(primitives.taken_at) : null,
    );
  }

  static create(
    medication_id: string,
    prescription_id: string,
    patient_id: string,
    frequency: string,
  ): MedicationReminder {
    return new MedicationReminder(
      MedicationReminderId.generate(),
      MedicationReminderMedicationId.fromString(medication_id),
      MedicationReminderPrescriptionId.fromString(prescription_id),
      MedicationReminderPatientId.fromString(patient_id),
      MedicationReminderScheduledTime.fromDate(
        MedicationReminderScheduleCalculator.calculateNextScheduledTime(frequency),
      ),
      MedicationReminderIsTaken.notTaken(),
      MedicationReminderForgotten.notForgotten(),
      MedicationReminderCreatedAt.now(),
      MedicationReminderUpdatedAt.now(),
    );
  }

  updateFrequency(frequency: string): void {
    this.scheduled_time = MedicationReminderScheduledTime.fromDate(
      MedicationReminderScheduleCalculator.calculateNextScheduledTime(frequency),
    );
    this.updated_at = MedicationReminderUpdatedAt.now();
  }

  markAsTaken(): void {
    this.is_taken = MedicationReminderIsTaken.taken();
    this.forgotten = MedicationReminderForgotten.notForgotten();
    this.taken_at = MedicationReminderTakenAt.now();
    this.updated_at = MedicationReminderUpdatedAt.now();
  }

  markAsForgotten(): void {
    this.forgotten = MedicationReminderForgotten.forgotten();
    this.is_taken = MedicationReminderIsTaken.notTaken();
    this.taken_at = null;
    this.updated_at = MedicationReminderUpdatedAt.now();
  }
}

