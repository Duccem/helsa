import { InvalidArgument } from "../errors/invalid-argument";
import { ValueObject } from "../value-object";

export class Enum<T> extends ValueObject<T> {
  constructor(
    value: T,
    public readonly validValues: T[],
  ) {
    super(value);
    this.ensureValidValue(value);
  }

  protected ensureValidValue(value: T): void {
    if (!this.validValues.includes(value)) {
      throw new InvalidArgument({ argument: this.name, value });
    }
  }

  public getValue(): T {
    return this.value;
  }

  validate(): void {
    if (this.value === null || this.value === undefined) {
      throw new InvalidArgument({ argument: this.name, value: this.value });
    }
  }
}

