import { NumberValueObject, StringValueObject } from "@/modules/shared/domain/value-object";
import { Enum } from "@/modules/shared/domain/value-objects/enum";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";
import { MedicationReminder } from "./medication-reminder";
import { Primitives } from "@/modules/shared/domain/primitives";

export class MedicationId extends Uuid {}
export class MedicationPrescriptionId extends Uuid {}
export class MedicationPatientId extends Uuid {}
export class MedicationName extends StringValueObject {}
export class MedicationDosage extends NumberValueObject {}
export class MedicationDosageUnit extends StringValueObject {}
export class MedicationFrequency extends StringValueObject {}
export class MedicationAdministrationMethod extends StringValueObject {}
export class MedicationNotes extends StringValueObject {}
export class MedicationCreatedAt extends Timestamp {}
export class MedicationUpdatedAt extends Timestamp {}
export class MedicationStartDate extends Timestamp {}
export class MedicationEndDate extends Timestamp {}

export enum MedicationStateValues {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
}

export class MedicationState extends Enum<MedicationStateValues> {
  constructor(value: MedicationStateValues) {
    super(value, Object.values(MedicationStateValues));
  }

  static fromString(value: string): MedicationState {
    return new MedicationState(value as MedicationStateValues);
  }

  static pending(): MedicationState {
    return new MedicationState(MedicationStateValues.PENDING);
  }
}

export type MedicationAlternativeDrug = {
  name: string;
  brand: string;
  dosage: string;
  dosage_unit: string;
  administration_method: string;
};

export class Medication {
  constructor(
    public id: MedicationId,
    public prescription_id: MedicationPrescriptionId,
    public patient_id: MedicationPatientId,
    public name: MedicationName,
    public dosage: MedicationDosage,
    public dosage_unit: MedicationDosageUnit,
    public frequency: MedicationFrequency,
    public administration_method: MedicationAdministrationMethod,
    public alternatives: MedicationAlternativeDrug[],
    public start_date: MedicationStartDate,
    public state: MedicationState,
    public created_at: MedicationCreatedAt,
    public updated_at: MedicationUpdatedAt,
    public end_date: MedicationEndDate | null,
    public notes: MedicationNotes | null,
    public reminders: MedicationReminder[] | null,
  ) {}

  toPrimitives(): Primitives<Medication> {
    return {
      id: this.id.value,
      prescription_id: this.prescription_id.value,
      patient_id: this.patient_id.value,
      name: this.name.value,
      dosage: this.dosage.value,
      dosage_unit: this.dosage_unit.value,
      frequency: this.frequency.value,
      administration_method: this.administration_method.value,
      alternatives: this.alternatives,
      start_date: this.start_date.value,
      end_date: this.end_date ? this.end_date?.value : null,
      notes: this.notes ? this.notes?.value : null,
      state: this.state.value,
      created_at: this.created_at.value,
      updated_at: this.updated_at.value,
      reminders: this.reminders ? this.reminders.map((reminder) => reminder.toPrimitives()) : null,
    };
  }

  static fromPrimitives(primitives: Primitives<Medication>): Medication {
    return new Medication(
      MedicationId.fromString(primitives.id),
      MedicationPrescriptionId.fromString(primitives.prescription_id),
      MedicationPatientId.fromString(primitives.patient_id),
      MedicationName.fromString(primitives.name),
      MedicationDosage.fromNumber(primitives.dosage),
      MedicationDosageUnit.fromString(primitives.dosage_unit),
      MedicationFrequency.fromString(primitives.frequency),
      MedicationAdministrationMethod.fromString(primitives.administration_method),
      primitives.alternatives ?? [],
      MedicationStartDate.fromDate(primitives.start_date),
      MedicationState.fromString(primitives.state),
      MedicationCreatedAt.fromDate(primitives.created_at),
      MedicationUpdatedAt.fromDate(primitives.updated_at),
      primitives.end_date ? MedicationEndDate.fromDate(primitives.end_date) : null,
      primitives.notes ? MedicationNotes.fromString(primitives.notes) : null,
      primitives.reminders ? primitives.reminders.map((reminder) => MedicationReminder.fromPrimitives(reminder)) : null,
    );
  }

  static create(params: {
    prescription_id: string;
    patient_id: string;
    name: string;
    dosage: number;
    dosage_unit: string;
    frequency: string;
    administration_method: string;
    alternatives?: MedicationAlternativeDrug[];
    start_date: Date;
    end_date?: Date;
    notes?: string;
    state?: MedicationStateValues;
  }): Medication {
    const medication = new Medication(
      MedicationId.generate(),
      MedicationPrescriptionId.fromString(params.prescription_id),
      MedicationPatientId.fromString(params.patient_id),
      MedicationName.fromString(params.name),
      MedicationDosage.fromNumber(params.dosage),
      MedicationDosageUnit.fromString(params.dosage_unit),
      MedicationFrequency.fromString(params.frequency),
      MedicationAdministrationMethod.fromString(params.administration_method),
      params.alternatives ?? [],
      MedicationStartDate.fromDate(params.start_date),
      MedicationState.fromString(params.state ?? MedicationStateValues.PENDING),
      MedicationCreatedAt.now(),
      MedicationUpdatedAt.now(),
      params.end_date ? MedicationEndDate.fromDate(params.end_date) : null,
      params.notes ? MedicationNotes.fromString(params.notes) : null,
      null,
    );

    medication.reminders = [];
    medication.reminders.push(
      MedicationReminder.create(
        medication.id.value,
        medication.prescription_id.value,
        medication.patient_id.value,
        medication.frequency.value,
      ),
    );

    return medication;
  }

  addNewReminder(): void {
    if (!this.reminders) {
      this.reminders = [];
    }

    this.reminders.push(
      MedicationReminder.create(this.id.value, this.prescription_id.value, this.patient_id.value, this.frequency.value),
    );
  }

  markAsTaken(reminder_id: string): void {
    if (!this.reminders) {
      return;
    }

    const reminder = this.reminders.find((r) => r.id.value === reminder_id);

    if (!reminder) {
      return;
    }

    reminder.markAsTaken();
  }

  markAsForgotten(reminder_id: string): void {
    if (!this.reminders) {
      return;
    }

    const reminder = this.reminders.find((r) => r.id.value === reminder_id);

    if (!reminder) {
      return;
    }

    reminder.markAsForgotten();
  }

  update(params: {
    name?: string;
    dosage?: number;
    dosage_unit?: string;
    frequency?: string;
    administration_method?: string;
    alternatives?: MedicationAlternativeDrug[];
    start_date?: Date;
    end_date?: Date | null;
    notes?: string | null;
    state?: MedicationStateValues;
  }): void {
    const previousFrequency = this.frequency.value;

    if (params.name) {
      this.name = MedicationName.fromString(params.name);
    }
    if (params.dosage !== undefined) {
      this.dosage = MedicationDosage.fromNumber(params.dosage);
    }
    if (params.dosage_unit) {
      this.dosage_unit = MedicationDosageUnit.fromString(params.dosage_unit);
    }
    if (params.frequency) {
      this.frequency = MedicationFrequency.fromString(params.frequency);
    }
    if (params.administration_method) {
      this.administration_method = MedicationAdministrationMethod.fromString(params.administration_method);
    }
    if (params.alternatives) {
      this.alternatives = params.alternatives;
    }
    if (params.start_date) {
      this.start_date = MedicationStartDate.fromDate(params.start_date);
    }
    if (params.end_date === null) {
      this.end_date = null;
    } else if (params.end_date) {
      this.end_date = MedicationEndDate.fromDate(params.end_date);
    }
    if (params.notes === null) {
      this.notes = null;
    } else if (params.notes) {
      this.notes = MedicationNotes.fromString(params.notes);
    }
    if (params.state) {
      this.state = MedicationState.fromString(params.state);
    }

    if (params.frequency && params.frequency !== previousFrequency && this.reminders) {
      this.reminders.forEach((reminder) => {
        reminder.updateFrequency(params.frequency!);
      });
    }

    this.updated_at = MedicationUpdatedAt.now();
  }
}

