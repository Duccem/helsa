import { Primitives } from "@/modules/shared/domain/primitives";
import { StringValueObject } from "@/modules/shared/domain/value-object";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";

export class SpecialtyId extends Uuid {}
export class SpecialtyName extends StringValueObject {}
export class SpecialtyColor extends StringValueObject {}

export class Specialty {
  constructor(
    public id: SpecialtyId,
    public name: SpecialtyName,
    public color: SpecialtyColor,
  ) {}

  toPrimitives(): Primitives<Specialty> {
    return {
      id: this.id.value,
      name: this.name.value,
      color: this.color.value,
    };
  }

  static fromPrimitives(primitives: Primitives<Specialty>): Specialty {
    return new Specialty(
      SpecialtyId.fromString(primitives.id),
      SpecialtyName.fromString(primitives.name),
      SpecialtyColor.fromString(primitives.color),
    );
  }

  static create(name: string, color: string): Specialty {
    return new Specialty(SpecialtyId.generate(), SpecialtyName.fromString(name), SpecialtyColor.fromString(color));
  }
}
