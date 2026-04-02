import { DomainEntity } from "@/modules/shared/domain/domain-entity";
import { Primitives } from "@/modules/shared/domain/primitives";
import { StringValueObject } from "@/modules/shared/domain/value-object";
import { Enum } from "@/modules/shared/domain/value-objects/enum";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";

export class AllergyId extends Uuid {}
export class AllergyPatientId extends Uuid {}
export class AllergyName extends StringValueObject {}
export class AllergyNotes extends StringValueObject {}
export class AllergyCreatedAt extends Timestamp {}
export class AllergyUpdatedAt extends Timestamp {}

export enum AllergySeverityValues {
  LOW = "LOW",
  MODERATE = "MODERATE",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export class AllergySeverity extends Enum<AllergySeverityValues> {
  constructor(value: AllergySeverityValues) {
    super(value, Object.values(AllergySeverityValues));
  }

  static fromString(value: string): AllergySeverity {
    return new AllergySeverity(value as AllergySeverityValues);
  }

  static low(): AllergySeverity {
    return new AllergySeverity(AllergySeverityValues.LOW);
  }
}

export class Allergy extends DomainEntity {
  constructor(
    public readonly id: AllergyId,
    public readonly patient_id: AllergyPatientId,
    public readonly name: AllergyName,
    public readonly severity: AllergySeverity,
    public readonly notes: AllergyNotes | undefined,
    public readonly created_at: AllergyCreatedAt,
    public readonly updated_at: AllergyUpdatedAt,
  ) {
    super(id);
  }

  toPrimitives(): Primitives<Allergy> {
    return {
      id: this.id.value,
      patient_id: this.patient_id.value,
      name: this.name.value,
      severity: this.severity.value,
      notes: this.notes?.value,
      created_at: this.created_at.value,
      updated_at: this.updated_at.value,
    };
  }

  static fromPrimitives(primitives: Primitives<Allergy>): Allergy {
    return new Allergy(
      AllergyId.fromString(primitives.id),
      AllergyPatientId.fromString(primitives.patient_id),
      AllergyName.fromString(primitives.name),
      AllergySeverity.fromString(primitives.severity as AllergySeverityValues),
      primitives.notes ? AllergyNotes.fromString(primitives.notes) : undefined,
      AllergyCreatedAt.fromDate(primitives.created_at),
      AllergyUpdatedAt.fromDate(primitives.updated_at),
    );
  }

  static create(
    patient_id: string,
    params: {
      name: string;
      severity?: string;
      notes?: string;
    },
  ): Allergy {
    return new Allergy(
      AllergyId.generate(),
      AllergyPatientId.fromString(patient_id),
      AllergyName.fromString(params.name),
      params.severity ? AllergySeverity.fromString(params.severity) : AllergySeverity.low(),
      params.notes ? AllergyNotes.fromString(params.notes) : undefined,
      AllergyCreatedAt.now(),
      AllergyUpdatedAt.now(),
    );
  }
}
