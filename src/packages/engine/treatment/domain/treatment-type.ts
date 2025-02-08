import { Enum } from '@helsa/ddd/core/value-objects/enum';

export enum TreatmentTypeValues {
  MEDICATION = 'MEDICATION',
  PROCEDURE = 'PROCEDURE',
  THERAPY = 'THERAPY',
}
export class TreatmentType extends Enum<TreatmentTypeValues> {
  constructor(value: TreatmentTypeValues) {
    super(value, Object.values(TreatmentTypeValues));
  }
}
