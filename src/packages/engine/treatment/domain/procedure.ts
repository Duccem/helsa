import { StringValueObject } from '@helsa/ddd/core/value-object';
import { Uuid } from '@helsa/ddd/core/value-objects/uuid';
import { Primitives } from '@helsa/ddd/types/primitives';

export class Procedure {
  constructor(public id: Uuid, public description: StringValueObject) {}
  toPrimitives(): Primitives<Procedure> {
    return {
      id: this.id.value,
      description: this.description.value,
    };
  }

  static fromPrimitives(params: Primitives<Procedure>): Procedure {
    return new Procedure(new Uuid(params.id), new StringValueObject(params.description));
  }

  static create(id: string, description: string): Procedure {
    return new Procedure(new Uuid(id), new StringValueObject(description));
  }
}
