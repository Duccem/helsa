import { Aggregate } from "@/modules/shared/domain/aggregate";
import { Primitives } from "@/modules/shared/domain/primitives";
import { Enum } from "@/modules/shared/domain/value-objects/enum";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";
import { StringValueObject } from "@/modules/shared/domain/value-object";
import { DiagnosisCreatedDomainEvent } from "./diagnosis-created-domain-event";

export class DiagnosisId extends Uuid {}
export class DiagnosisPatientId extends Uuid {}
export class DiagnosisSummary extends StringValueObject {}
export class DiagnosisCieCode extends StringValueObject {}
export class DiagnosisCreatedAt extends Timestamp {}
export class DiagnosisUpdatedAt extends Timestamp {}

export enum DiagnosisCertaintyValues {
  PRESUMPTIVE = "PRESUMPTIVE",
  DIFFERENTIAL = "DIFFERENTIAL",
  DEFINITIVE = "DEFINITIVE",
  DISCARD = "DISCARD",
}

export class DiagnosisCertainty extends Enum<DiagnosisCertaintyValues> {
  constructor(value: DiagnosisCertaintyValues) {
    super(value, Object.values(DiagnosisCertaintyValues));
  }

  static fromString(value: string): DiagnosisCertainty {
    return new DiagnosisCertainty(value as DiagnosisCertaintyValues);
  }

  static presumptive(): DiagnosisCertainty {
    return new DiagnosisCertainty(DiagnosisCertaintyValues.PRESUMPTIVE);
  }
}

export enum DiagnosisStateValues {
  ACTIVE = "ACTIVE",
  REMISSION = "REMISSION",
  CURED = "CURED",
  RECURRENT = "RECURRENT",
  DECEASED = "DECEASED",
}

export class DiagnosisState extends Enum<DiagnosisStateValues> {
  constructor(value: DiagnosisStateValues) {
    super(value, Object.values(DiagnosisStateValues));
  }

  static fromString(value: string): DiagnosisState {
    return new DiagnosisState(value as DiagnosisStateValues);
  }

  static active(): DiagnosisState {
    return new DiagnosisState(DiagnosisStateValues.ACTIVE);
  }
}

export enum DiagnosisIncomeValues {
  INCOME = "INCOME",
  PRINCIPAL = "PRINCIPAL",
  SECONDARY = "SECONDARY",
  EGRESS = "EGRESS",
}

export class DiagnosisIncome extends Enum<DiagnosisIncomeValues> {
  constructor(value: DiagnosisIncomeValues) {
    super(value, Object.values(DiagnosisIncomeValues));
  }

  static fromString(value: string): DiagnosisIncome {
    return new DiagnosisIncome(value as DiagnosisIncomeValues);
  }

  static income(): DiagnosisIncome {
    return new DiagnosisIncome(DiagnosisIncomeValues.INCOME);
  }
}

export class Diagnosis extends Aggregate {
  constructor(
    public id: DiagnosisId,
    public patient_id: DiagnosisPatientId,
    public summary: DiagnosisSummary,
    public cie_code: DiagnosisCieCode,
    public certainty: DiagnosisCertainty,
    public state: DiagnosisState,
    public income: DiagnosisIncome,
    public created_at: DiagnosisCreatedAt,
    public updated_at: DiagnosisUpdatedAt,
  ) {
    super();
  }

  toPrimitives(): Primitives<Diagnosis> {
    return {
      id: this.id.value,
      patient_id: this.patient_id.value,
      summary: this.summary.value,
      cie_code: this.cie_code.value,
      certainty: this.certainty.value,
      state: this.state.value,
      income: this.income.value,
      created_at: this.created_at.value,
      updated_at: this.updated_at.value,
    };
  }

  static fromPrimitives(primitives: Primitives<Diagnosis>): Diagnosis {
    return new Diagnosis(
      DiagnosisId.fromString(primitives.id),
      DiagnosisPatientId.fromString(primitives.patient_id),
      DiagnosisSummary.fromString(primitives.summary),
      DiagnosisCieCode.fromString(primitives.cie_code),
      DiagnosisCertainty.fromString(primitives.certainty),
      DiagnosisState.fromString(primitives.state),
      DiagnosisIncome.fromString(primitives.income),
      DiagnosisCreatedAt.fromDate(primitives.created_at),
      DiagnosisUpdatedAt.fromDate(primitives.updated_at),
    );
  }

  static create(params: {
    patient_id: string;
    summary: string;
    cie_code: string;
    certainty?: DiagnosisCertaintyValues;
    state?: DiagnosisStateValues;
    income?: DiagnosisIncomeValues;
  }): Diagnosis {
    const diagnosis = new Diagnosis(
      DiagnosisId.generate(),
      DiagnosisPatientId.fromString(params.patient_id),
      DiagnosisSummary.fromString(params.summary),
      DiagnosisCieCode.fromString(params.cie_code),
      DiagnosisCertainty.fromString(params.certainty ?? DiagnosisCertaintyValues.PRESUMPTIVE),
      DiagnosisState.fromString(params.state ?? DiagnosisStateValues.ACTIVE),
      DiagnosisIncome.fromString(params.income ?? DiagnosisIncomeValues.INCOME),
      DiagnosisCreatedAt.now(),
      DiagnosisUpdatedAt.now(),
    );

    diagnosis.record(
      new DiagnosisCreatedDomainEvent(diagnosis.id.value, {
        patient_id: diagnosis.patient_id.value,
        summary: diagnosis.summary.value,
        cie_code: diagnosis.cie_code.value,
        certainty: diagnosis.certainty.value,
        state: diagnosis.state.value,
        income: diagnosis.income.value,
      }),
    );

    return diagnosis;
  }
}

