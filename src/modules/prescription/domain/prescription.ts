import { Aggregate } from "@/modules/shared/domain/aggregate";
import { Primitives } from "@/modules/shared/domain/primitives";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";
import { MedicationAddedDomainEvent } from "./medication-added-domain-event";
import { MedicationNotFound, MedicationReminderNotFound } from "./medication-not-found";
import { Medication, MedicationAlternativeDrug, MedicationStateValues } from "./medication";
import { MedicationReminder } from "./medication-reminder";
import { StringValueObject } from "@/modules/shared/domain/value-object";

export class PrescriptionId extends Uuid {}
export class PrescriptionPatientId extends Uuid {}
export class PrescriptionDoctorId extends Uuid {}
export class PrescriptionOrganizationId extends Uuid {}
export class PrescriptionObservation extends StringValueObject {}
export class PrescriptionCreatedAt extends Timestamp {}
export class PrescriptionUpdatedAt extends Timestamp {}

export class Prescription extends Aggregate {
  constructor(
    public id: PrescriptionId,
    public patient_id: PrescriptionPatientId,
    public doctor_id: PrescriptionDoctorId,
    public organization_id: PrescriptionOrganizationId,
    public observation: PrescriptionObservation,
    public created_at: PrescriptionCreatedAt,
    public updated_at: PrescriptionUpdatedAt,
    public medications?: Medication[],
  ) {
    super();
  }

  toPrimitives(): Primitives<Prescription> {
    return {
      id: this.id.value,
      patient_id: this.patient_id.value,
      doctor_id: this.doctor_id.value,
      organization_id: this.organization_id.value,
      observation: this.observation.value,
      created_at: this.created_at.value,
      updated_at: this.updated_at.value,
      medications: this.medications?.map((medication) => medication.toPrimitives()),
    };
  }

  static fromPrimitives(primitives: Primitives<Prescription>): Prescription {
    return new Prescription(
      PrescriptionId.fromString(primitives.id),
      PrescriptionPatientId.fromString(primitives.patient_id),
      PrescriptionDoctorId.fromString(primitives.doctor_id),
      PrescriptionOrganizationId.fromString(primitives.organization_id),
      PrescriptionObservation.fromString(primitives.observation),
      PrescriptionCreatedAt.fromDate(primitives.created_at),
      PrescriptionUpdatedAt.fromDate(primitives.updated_at),
      primitives.medications?.map((medication) => Medication.fromPrimitives(medication)),
    );
  }

  static create(params: {
    patient_id: string;
    doctor_id: string;
    organization_id: string;
    observation: string;
  }): Prescription {
    return new Prescription(
      PrescriptionId.generate(),
      PrescriptionPatientId.fromString(params.patient_id),
      PrescriptionDoctorId.fromString(params.doctor_id),
      PrescriptionOrganizationId.fromString(params.organization_id),
      PrescriptionObservation.fromString(params.observation),
      PrescriptionCreatedAt.now(),
      PrescriptionUpdatedAt.now(),
      [],
    );
  }

  update(observation: string): void {
    this.observation = PrescriptionObservation.fromString(observation);
    this.updated_at = PrescriptionUpdatedAt.now();
  }

  addMedication(params: {
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
    const medication = Medication.create({
      ...params,
      prescription_id: this.id.value,
      patient_id: this.patient_id.value,
    });

    if (!this.medications) {
      this.medications = [];
    }

    this.medications.push(medication);
    this.updated_at = PrescriptionUpdatedAt.now();

    this.record(
      new MedicationAddedDomainEvent(this.id.value, {
        prescription_id: this.id.value,
        medication_id: medication.id.value,
        patient_id: this.patient_id.value,
        frequency: medication.frequency.value,
      }),
    );

    return medication;
  }

  updateMedication(
    medication_id: string,
    params: {
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
    },
  ): void {
    const medication = this.medications?.find((item) => item.id.value === medication_id);
    if (!medication) {
      throw new MedicationNotFound(medication_id);
    }

    medication.update(params);
    this.updated_at = PrescriptionUpdatedAt.now();
  }

  markReminderAsTaken(reminder_id: string): void {
    const reminder = this.findReminder(reminder_id);

    reminder.markAsTaken();
    this.updated_at = PrescriptionUpdatedAt.now();
  }

  markRemindersAsForgotten(reminder_ids: string[]): void {
    const reminders = reminder_ids.map((reminder_id) => this.findReminder(reminder_id));

    reminders.forEach((reminder) => reminder.markAsForgotten());
    this.updated_at = PrescriptionUpdatedAt.now();
  }

  private findReminder(reminder_id: string): MedicationReminder {
    const reminder = this.medications
      ?.map((medication) => medication.reminder)
      .find((item) => item?.id.value === reminder_id);

    if (!reminder) {
      throw new MedicationReminderNotFound(reminder_id);
    }

    return reminder;
  }
}

