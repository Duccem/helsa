import { Aggregate } from "@/modules/shared/domain/aggregate";
import { Primitives } from "@/modules/shared/domain/primitives";
import { StringValueObject, ValueObject } from "@/modules/shared/domain/value-object";
import { Enum } from "@/modules/shared/domain/value-objects/enum";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";

export enum MedicalRecordTypeValues {
  DIAGNOSIS = "DIAGNOSIS",
  PRESCRIPTION = "PRESCRIPTION",
  NOTE = "NOTE",
  LAB_RESULT = "LAB_RESULT",
  IMAGING_RESULT = "IMAGING_RESULT",
  IMMUNIZATION = "IMMUNIZATION",
  PROCEDURE = "PROCEDURE",
  PLAN = "PLAN",
  OTHER = "OTHER",
}

export enum MedicalRecordPriorityValues {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum MedicalRecordStatusValues {
  FINAL = "FINAL",
  DRAFT = "DRAFT",
  AMENDED = "AMENDED",
  CORRECTED = "CORRECTED",
  APPENDED = "APPENDED",
}

export class MedicalRecordId extends Uuid {}
export class MedicalRecordPatientId extends Uuid {}
export class MedicalRecordDoctorId extends Uuid {}
export class MedicalRecordType extends Enum<MedicalRecordTypeValues> {
  constructor(value: MedicalRecordTypeValues) {
    super(value, Object.values(MedicalRecordTypeValues));
  }
}

export class MedicalRecordPriority extends Enum<MedicalRecordPriorityValues> {
  constructor(value: MedicalRecordPriorityValues) {
    super(value, Object.values(MedicalRecordPriorityValues));
  }
}

export class MedicalRecordStatus extends Enum<MedicalRecordStatusValues> {
  constructor(value: MedicalRecordStatusValues) {
    super(value, Object.values(MedicalRecordStatusValues));
  }
}

export class MedicalRecordTitle extends StringValueObject {}
export class MedicalRecordDescription extends StringValueObject {}
export class MedicalRecordTags extends ValueObject<Array<string>> {
  validate(): void {
    if (!Array.isArray(this.value)) {
      throw new Error(`${this.name} must be an array of strings`);
    }
  }
}
export class MedicalRecordDate extends Timestamp {}

export class MedicalRecord extends Aggregate {
  constructor(
    public id: MedicalRecordId,
    public patient_id: MedicalRecordPatientId,
    public doctor_id: MedicalRecordDoctorId,
    public type: MedicalRecordType,
    public title: MedicalRecordTitle,
    public description: MedicalRecordDescription,
    public date: MedicalRecordDate,
    public priority: MedicalRecordPriority,
    public tags: MedicalRecordTags,
    public status: MedicalRecordStatus,
  ) {
    super(id);
  }

  toPrimitives(): Primitives<MedicalRecord> {
    return {
      id: this.id.value,
      patient_id: this.patient_id.value,
      doctor_id: this.doctor_id.value,
      type: this.type.value,
      title: this.title.value,
      description: this.description.value,
      date: this.date.value,
      priority: this.priority.value,
      tags: this.tags.value,
      status: this.status.value,
    };
  }

  static fromPrimitives(primitives: Primitives<MedicalRecord>): MedicalRecord {
    return new MedicalRecord(
      new MedicalRecordId(primitives.id),
      new MedicalRecordPatientId(primitives.patient_id),
      new MedicalRecordDoctorId(primitives.doctor_id),
      new MedicalRecordType(primitives.type as MedicalRecordTypeValues),
      new MedicalRecordTitle(primitives.title),
      new MedicalRecordDescription(primitives.description),
      new MedicalRecordDate(new Date(primitives.date)),
      new MedicalRecordPriority(primitives.priority as MedicalRecordPriorityValues),
      new MedicalRecordTags(primitives.tags),
      new MedicalRecordStatus(primitives.status as MedicalRecordStatusValues),
    );
  }
}

