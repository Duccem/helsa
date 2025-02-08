import { Enum } from '@helsa/ddd/core/value-objects/enum';

export enum TreatmentStatusValues {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
export class TreatmentStatus extends Enum<TreatmentStatusValues> {
  constructor(value: TreatmentStatusValues) {
    super(value, Object.values(TreatmentStatusValues));
  }
}
