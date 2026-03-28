import { DomainEntity } from "@/modules/shared/domain/domain-entity";
import { Primitives } from "@/modules/shared/domain/primitives";
import { StringValueObject } from "@/modules/shared/domain/value-object";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";

export class DoctorPatientId extends Uuid {}
export class DoctorPatientName extends StringValueObject {}
export class DoctorPatientEmail extends StringValueObject {}

export class DoctorPatient extends DomainEntity {
  constructor(
    public id: DoctorPatientId,
    public name: DoctorPatientName,
    public email: DoctorPatientEmail,
  ) {
    super(id);
  }

  toPrimitives(): Primitives<DoctorPatient> {
    return {
      id: this.id.value,
      name: this.name.value,
      email: this.email.value,
    };
  }

  static fromPrimitives(primitives: Primitives<DoctorPatient>): DoctorPatient {
    return new DoctorPatient(
      DoctorPatientId.fromString(primitives.id),
      DoctorPatientName.fromString(primitives.name),
      DoctorPatientEmail.fromString(primitives.email),
    );
  }
}
