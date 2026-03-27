import { Primitives } from "./primitives";
import { Uuid } from "./value-objects/uuid";

export abstract class DomainEntity {
  constructor(public id: Uuid) {}

  abstract toPrimitives(): Primitives<DomainEntity>;
}

