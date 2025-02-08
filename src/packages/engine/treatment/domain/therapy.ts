import { StringValueObject } from '@helsa/ddd/core/value-object';
import { Uuid } from '@helsa/ddd/core/value-objects/uuid';
import { Primitives } from '@helsa/ddd/types/primitives';

export class Therapy {
  constructor(public id: Uuid, public description: StringValueObject) {}

  toPrimitives(): Primitives<Therapy> {
    return {
      id: this.id.value,
      description: this.description.value,
    };
  }

  static fromPrimitives(params: Primitives<Therapy>): Therapy {
    return new Therapy(new Uuid(params.id), new StringValueObject(params.description));
  }

  static create(id: string, description: string): Therapy {
    return new Therapy(new Uuid(id), new StringValueObject(description));
  }
}
