import { StringValueObject } from '@helsa/ddd/core/value-object';
import { Uuid } from '@helsa/ddd/core/value-objects/uuid';
import { Primitives } from '@helsa/ddd/types/primitives';

export class Medication {
  constructor(
    public id: Uuid,
    public name: StringValueObject,
    public dose: StringValueObject,
    public frequency: StringValueObject,
    public presentation: StringValueObject
  ) {}

  toPrimitives(): Primitives<Medication> {
    return {
      id: this.id.value,
      name: this.name.value,
      dose: this.dose.value,
      frequency: this.frequency.value,
      presentation: this.presentation.value,
    };
  }

  static fromPrimitives(params: Primitives<Medication>): Medication {
    return new Medication(
      new Uuid(params.id),
      new StringValueObject(params.name),
      new StringValueObject(params.dose),
      new StringValueObject(params.frequency),
      new StringValueObject(params.presentation)
    );
  }

  static create(id: string, name: string, dose: string, frequency: string, presentation: string): Medication {
    return new Medication(
      new Uuid(id),
      new StringValueObject(name),
      new StringValueObject(dose),
      new StringValueObject(frequency),
      new StringValueObject(presentation)
    );
  }
}
