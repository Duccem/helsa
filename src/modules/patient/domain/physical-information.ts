import { DomainEntity } from "@/modules/shared/domain/domain-entity";
import { Primitives } from "@/modules/shared/domain/primitives";
import { NumberValueObject, StringValueObject } from "@/modules/shared/domain/value-object";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";

export class PhysicalInformationId extends Uuid {}
export class PhysicalInformationPatientId extends Uuid {}
export class PhysicalInformationHeight extends NumberValueObject {}
export class PhysicalInformationWeight extends NumberValueObject {}
export class PhysicalInformationBloodType extends StringValueObject {}
export class PhysicalInformationBodyMassIndex extends NumberValueObject {}
export class PhysicalInformationCreatedAt extends Timestamp {}
export class PhysicalInformationUpdatedAt extends Timestamp {}

export class PhysicalInformation extends DomainEntity {
  constructor(
    public readonly id: PhysicalInformationId,
    public readonly patient_id: PhysicalInformationPatientId,
    public readonly height: PhysicalInformationHeight,
    public readonly weight: PhysicalInformationWeight,
    public readonly body_mass_index: PhysicalInformationBodyMassIndex,
    public readonly created_at: PhysicalInformationCreatedAt,
    public readonly updated_at: PhysicalInformationUpdatedAt,
    public readonly blood_type?: PhysicalInformationBloodType,
  ) {
    super(id);
  }

  toPrimitives(): Primitives<PhysicalInformation> {
    return {
      id: this.id.value,
      patient_id: this.patient_id.value,
      height: this.height.value,
      weight: this.weight.value,
      blood_type: this.blood_type?.value,
      body_mass_index: this.body_mass_index.value,
      created_at: this.created_at.value,
      updated_at: this.updated_at.value,
    };
  }

  static fromPrimitives(primitives: Primitives<PhysicalInformation>): PhysicalInformation {
    return new PhysicalInformation(
      PhysicalInformationId.fromString(primitives.id),
      PhysicalInformationPatientId.fromString(primitives.patient_id),
      PhysicalInformationHeight.fromNumber(primitives.height),
      PhysicalInformationWeight.fromNumber(primitives.weight),
      PhysicalInformationBodyMassIndex.fromNumber(primitives.body_mass_index),
      PhysicalInformationCreatedAt.fromDate(primitives.created_at),
      PhysicalInformationUpdatedAt.fromDate(primitives.updated_at),
      primitives.blood_type ? PhysicalInformationBloodType.fromString(primitives.blood_type) : undefined,
    );
  }

  static create(
    patient_id: string,
    params: {
      height?: number;
      weight?: number;
      blood_type?: string;
      body_mass_index?: number;
    },
  ): PhysicalInformation {
    return new PhysicalInformation(
      PhysicalInformationId.generate(),
      PhysicalInformationPatientId.fromString(patient_id),
      PhysicalInformationHeight.fromNumber(params.height ?? 0),
      PhysicalInformationWeight.fromNumber(params.weight ?? 0),
      PhysicalInformationBodyMassIndex.fromNumber(params.body_mass_index ?? 0),
      PhysicalInformationCreatedAt.now(),
      PhysicalInformationUpdatedAt.now(),
      params.blood_type ? PhysicalInformationBloodType.fromString(params.blood_type) : undefined,
    );
  }
}

