import { DomainEntity } from "@/modules/shared/domain/domain-entity";
import { Primitives } from "@/modules/shared/domain/primitives";
import { NumberValueObject } from "@/modules/shared/domain/value-object";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";

export class VitalsId extends Uuid {}
export class VitalsPatientId extends Uuid {}
export class VitalsBloodPressure extends NumberValueObject {}
export class VitalsHeartRate extends NumberValueObject {}
export class VitalsRespiratoryRate extends NumberValueObject {}
export class VitalsOxygenSaturation extends NumberValueObject {}
export class VitalsTemperature extends NumberValueObject {}
export class VitalsCreatedAt extends Timestamp {}
export class VitalsUpdatedAt extends Timestamp {}

export class Vitals extends DomainEntity {
  constructor(
    public readonly id: VitalsId,
    public readonly patient_id: VitalsPatientId,
    public readonly blood_pressure: VitalsBloodPressure,
    public readonly heart_rate: VitalsHeartRate,
    public readonly respiratory_rate: VitalsRespiratoryRate,
    public readonly oxygen_saturation: VitalsOxygenSaturation,
    public readonly temperature: VitalsTemperature,
    public readonly created_at: VitalsCreatedAt,
    public readonly updated_at: VitalsUpdatedAt,
  ) {
    super(id);
  }

  toPrimitives(): Primitives<Vitals> {
    return {
      id: this.id.value,
      patient_id: this.patient_id.value,
      blood_pressure: this.blood_pressure.value,
      heart_rate: this.heart_rate.value,
      respiratory_rate: this.respiratory_rate.value,
      oxygen_saturation: this.oxygen_saturation.value,
      temperature: this.temperature.value,
      created_at: this.created_at.value,
      updated_at: this.updated_at.value,
    };
  }

  static fromPrimitives(primitives: Primitives<Vitals>): Vitals {
    return new Vitals(
      VitalsId.fromString(primitives.id),
      VitalsPatientId.fromString(primitives.patient_id),
      VitalsBloodPressure.fromNumber(primitives.blood_pressure),
      VitalsHeartRate.fromNumber(primitives.heart_rate),
      VitalsRespiratoryRate.fromNumber(primitives.respiratory_rate),
      VitalsOxygenSaturation.fromNumber(primitives.oxygen_saturation),
      VitalsTemperature.fromNumber(primitives.temperature),
      VitalsCreatedAt.fromDate(primitives.created_at),
      VitalsUpdatedAt.fromDate(primitives.updated_at),
    );
  }

  static create(
    patient_id: string,
    params: {
      blood_pressure?: number;
      heart_rate?: number;
      respiratory_rate?: number;
      oxygen_saturation?: number;
      temperature?: number;
    },
  ): Vitals {
    return new Vitals(
      VitalsId.generate(),
      VitalsPatientId.fromString(patient_id),
      VitalsBloodPressure.fromNumber(params.blood_pressure ?? 0),
      VitalsHeartRate.fromNumber(params.heart_rate ?? 0),
      VitalsRespiratoryRate.fromNumber(params.respiratory_rate ?? 0),
      VitalsOxygenSaturation.fromNumber(params.oxygen_saturation ?? 0),
      VitalsTemperature.fromNumber(params.temperature ?? 0),
      VitalsCreatedAt.now(),
      VitalsUpdatedAt.now(),
    );
  }
}

