import { Aggregate } from "@/modules/shared/domain/aggregate";
import { Primitives } from "@/modules/shared/domain/primitives";
import { StringValueObject } from "@/modules/shared/domain/value-object";
import { Enum } from "@/modules/shared/domain/value-objects/enum";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";
import { ContactInfo } from "./contact-info";
import { PhysicalInformation } from "./physical-information";
import { Vitals } from "./vitals";

export class PatientId extends Uuid {}
export class PatientUserId extends Uuid {}
export class PatientEmail extends StringValueObject {}
export class PatientName extends StringValueObject {}
export class PatientBirthDate extends Timestamp {}
export class PatientCreatedAt extends Timestamp {}
export class PatientUpdatedAt extends Timestamp {}

export enum PatientGenderValues {
  MAN = "MAN",
  WOMAN = "WOMAN",
  OTHER = "OTHER",
}

export class PatientGender extends Enum<PatientGenderValues> {
  constructor(value: PatientGenderValues) {
    super(value, Object.values(PatientGenderValues));
  }

  static fromString(value: string): PatientGender {
    return new PatientGender(value as PatientGenderValues);
  }

  static other(): PatientGender {
    return new PatientGender(PatientGenderValues.OTHER);
  }
}

export class Patient extends Aggregate {
  constructor(
    public id: PatientId,
    public user_id: PatientUserId,
    public email: PatientEmail,
    public name: PatientName,
    public birth_date: PatientBirthDate,
    public gender: PatientGender,
    public created_at: PatientCreatedAt,
    public updated_at: PatientUpdatedAt,
    public contact_info?: ContactInfo[],
    public vitals?: Vitals[],
    public physical_information?: PhysicalInformation,
  ) {
    super(id);
  }

  toPrimitives(): Primitives<Patient> {
    return {
      id: this.id.value,
      user_id: this.user_id.value,
      email: this.email.value,
      name: this.name.value,
      birth_date: this.birth_date.value,
      gender: this.gender.value,
      created_at: this.created_at.value,
      updated_at: this.updated_at.value,
      contact_info: this.contact_info?.map((item) => item.toPrimitives()),
      vitals: this.vitals?.map((item) => item.toPrimitives()),
      physical_information: this.physical_information?.toPrimitives(),
    };
  }

  static fromPrimitives(primitives: Primitives<Patient>): Patient {
    return new Patient(
      PatientId.fromString(primitives.id),
      PatientUserId.fromString(primitives.user_id),
      PatientEmail.fromString(primitives.email),
      PatientName.fromString(primitives.name),
      PatientBirthDate.fromDate(primitives.birth_date),
      PatientGender.fromString(primitives.gender as PatientGenderValues),
      PatientCreatedAt.fromDate(primitives.created_at),
      PatientUpdatedAt.fromDate(primitives.updated_at),
      primitives.contact_info?.map((item) => ContactInfo.fromPrimitives(item)),
      primitives.vitals?.map((item) => Vitals.fromPrimitives(item)),
      primitives.physical_information ? PhysicalInformation.fromPrimitives(primitives.physical_information) : undefined,
    );
  }

  static create(
    user_id: string,
    email: string,
    name: string,
    birth_date: Date,
    gender: string = PatientGenderValues.OTHER,
  ): Patient {
    return new Patient(
      PatientId.generate(),
      PatientUserId.fromString(user_id),
      PatientEmail.fromString(email),
      PatientName.fromString(name),
      PatientBirthDate.fromDate(birth_date),
      PatientGender.fromString(gender),
      PatientCreatedAt.now(),
      PatientUpdatedAt.now(),
    );
  }

  update(params: { email?: string; name: string; birth_date: Date; gender?: string }): void {
    this.email = params.email ? PatientEmail.fromString(params.email) : this.email;
    this.name = PatientName.fromString(params.name);
    this.birth_date = PatientBirthDate.fromDate(params.birth_date);
    this.gender = params.gender ? PatientGender.fromString(params.gender) : this.gender;
    this.updated_at = PatientUpdatedAt.now();
  }

  addContactInfo(params: { phone?: string; address?: string }): void {
    if (!this.contact_info) {
      this.contact_info = [];
    }

    this.contact_info.push(ContactInfo.create(this.id.value, params));
    this.updated_at = PatientUpdatedAt.now();
  }

  addVitals(params: {
    blood_pressure?: number;
    heart_rate?: number;
    respiratory_rate?: number;
    oxygen_saturation?: number;
    temperature?: number;
  }): void {
    if (!this.vitals) {
      this.vitals = [];
    }

    this.vitals.push(Vitals.create(this.id.value, params));
    this.updated_at = PatientUpdatedAt.now();
  }

  setPhysicalInformation(params: {
    height?: number;
    weight?: number;
    blood_type?: string;
    body_mass_index?: number;
  }): void {
    this.physical_information = PhysicalInformation.create(this.id.value, params);
    this.updated_at = PatientUpdatedAt.now();
  }
}

