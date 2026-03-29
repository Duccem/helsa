import { DomainEntity } from "@/modules/shared/domain/domain-entity";
import { Primitives } from "@/modules/shared/domain/primitives";
import { StringValueObject, ValueObject } from "@/modules/shared/domain/value-object";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";

export class AppointmentPatientId extends Uuid {}
export class AppointmentPatientName extends StringValueObject {}
export class AppointmentPatientEmail extends StringValueObject {}
export class AppointmentPatientPhotoUrl extends ValueObject<string | undefined> {
  constructor(value: string | undefined) {
    super(value);
  }

  validate(): void {
    if (this.value === undefined) return;
    try {
      new URL(this.value);
    } catch {
      throw new Error(`${this.name} must be a valid URL`);
    }
  }
}
export class AppointmentPatientBirthDate extends Timestamp {}

export class AppointmentPatient extends DomainEntity {
  constructor(
    public id: AppointmentPatientId,
    public name: AppointmentPatientName,
    public email: AppointmentPatientEmail,
    public photo_url: AppointmentPatientPhotoUrl,
    public birth_date: AppointmentPatientBirthDate,
  ) {
    super(id);
  }

  toPrimitives(): Primitives<AppointmentPatient> {
    return {
      id: this.id.value,
      name: this.name.value,
      email: this.email.value,
      photo_url: this.photo_url.value,
      birth_date: this.birth_date.value,
    };
  }

  static fromPrimitives(primitives: Primitives<AppointmentPatient>): AppointmentPatient {
    return new AppointmentPatient(
      AppointmentPatientId.fromString(primitives.id),
      new AppointmentPatientName(primitives.name),
      new AppointmentPatientEmail(primitives.email),
      new AppointmentPatientPhotoUrl(primitives.photo_url),
      new AppointmentPatientBirthDate(primitives.birth_date),
    );
  }
}

