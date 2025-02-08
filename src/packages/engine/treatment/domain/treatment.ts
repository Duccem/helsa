import { Aggregate } from '@helsa/ddd/core/aggregate';
import { DateValueObject, StringValueObject } from '@helsa/ddd/core/value-object';
import { Uuid } from '@helsa/ddd/core/value-objects/uuid';
import { Primitives } from '@helsa/ddd/types/primitives';
import { Medication } from './medication';
import { Procedure } from './procedure';
import { Therapy } from './therapy';
import { TreatmentStatus } from './treatment-status';
import { TreatmentType, TreatmentTypeValues } from './treatment-type';

export class Treatment extends Aggregate {
  constructor(
    id: Uuid,
    public description: StringValueObject,
    public type: TreatmentType,
    public status: TreatmentStatus,
    public startDate: DateValueObject,
    public endDate: DateValueObject,
    public patientId: Uuid,
    public doctorId: Uuid,
    public appointmentId: Uuid,
    createdAt: DateValueObject,
    updatedAt: DateValueObject,
    public medication?: Medication,
    public therapy?: Therapy,
    public procedure?: Procedure
  ) {
    super(id, createdAt, updatedAt);
  }

  toPrimitives(): Primitives<Treatment> {
    return {
      id: this.id.value,
      description: this.description.value,
      type: this.type.value,
      status: this.status.value,
      startDate: this.startDate.value,
      endDate: this.endDate.value,
      patientId: this.patientId.value,
      doctorId: this.doctorId.value,
      appointmentId: this.appointmentId.value,
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value,
      medication: this.medication ? this.medication.toPrimitives() : undefined,
      therapy: this.therapy ? this.therapy.toPrimitives() : undefined,
      procedure: this.procedure ? this.procedure.toPrimitives() : undefined,
    };
  }

  static fromPrimitives(params: Primitives<Treatment>): Treatment {
    return new Treatment(
      new Uuid(params.id),
      new StringValueObject(params.description),
      new TreatmentType(params.type),
      new TreatmentStatus(params.status),
      new DateValueObject(params.startDate),
      new DateValueObject(params.endDate),
      new Uuid(params.patientId),
      new Uuid(params.doctorId),
      new Uuid(params.appointmentId),
      new DateValueObject(params.createdAt),
      new DateValueObject(params.updatedAt),
      params.medication ? Medication.fromPrimitives(params.medication) : undefined,
      params.therapy ? Therapy.fromPrimitives(params.therapy) : undefined,
      params.procedure ? Procedure.fromPrimitives(params.procedure) : undefined
    );
  }

  static create(
    id: string,
    description: string,
    type: string,
    status: string,
    startDate: Date,
    endDate: Date,
    patientId: string,
    doctorId: string,
    appointmentId: string,
    extraData?: Primitives<Medication> | Primitives<Therapy> | Primitives<Procedure>
  ): Treatment {
    return new Treatment(
      new Uuid(id),
      new StringValueObject(description),
      new TreatmentType(type as any),
      new TreatmentStatus(status as any),
      new DateValueObject(startDate),
      new DateValueObject(endDate),
      new Uuid(patientId),
      new Uuid(doctorId),
      new Uuid(appointmentId),
      DateValueObject.today(),
      DateValueObject.today(),
      type === TreatmentTypeValues.MEDICATION
        ? Medication.create(
            Uuid.random().value,
            (extraData as Primitives<Medication>)?.name,
            (extraData as Primitives<Medication>)?.dose,
            (extraData as Primitives<Medication>)?.frequency,
            (extraData as Primitives<Medication>)?.presentation
          )
        : undefined,
      type === TreatmentTypeValues.THERAPY
        ? Therapy.create(Uuid.random().value, (extraData as Primitives<Therapy>)?.description)
        : undefined,
      type === TreatmentTypeValues.PROCEDURE
        ? Procedure.create(Uuid.random().value, (extraData as Primitives<Procedure>)?.description)
        : undefined
    );
  }
}
