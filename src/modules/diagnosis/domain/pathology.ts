import { Primitives } from "@/modules/shared/domain/primitives";
import { StringValueObject } from "@/modules/shared/domain/value-object";

export class PathologyCode extends StringValueObject {}
export class PathologySummary extends StringValueObject {}

export class Pathology {
  constructor(
    public cie_code: PathologyCode,
    public summary: PathologySummary,
  ) {}

  toPrimitives(): Primitives<Pathology> {
    return {
      cie_code: this.cie_code.value,
      summary: this.summary.value,
    };
  }

  static fromPrimitives(primitives: Primitives<Pathology>): Pathology {
    return new Pathology(
      PathologyCode.fromString(primitives.cie_code),
      PathologySummary.fromString(primitives.summary),
    );
  }
}

