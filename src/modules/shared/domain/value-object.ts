export abstract class ValueObject<T> {
  public readonly value: T;
  protected readonly name: string;

  constructor(value: T) {
    this.value = value;
    this.validate();
    this.name = this.constructor.name;
  }

  equals(other: ValueObject<T>): boolean {
    if (this.value === other.value) return true;
    if (typeof this.value === "object" && typeof other.value === "object") {
      return JSON.stringify(this.value) === JSON.stringify(other.value);
    }
    return false;
  }

  toString(): string {
    return String(this.value);
  }

  abstract validate(): void;
}

export class StringValueObject extends ValueObject<string> {
  validate(): void {
    if (this.value.trim().length === 0) {
      throw new Error("Value cannot be empty");
    }
  }

  static fromString(value: string): StringValueObject {
    return new StringValueObject(value);
  }
}

export class NumberValueObject extends ValueObject<number> {
  validate(): void {
    if (isNaN(this.value)) {
      throw new Error("Value must be a number");
    }
  }

  static fromNumber(value: number): NumberValueObject {
    return new NumberValueObject(value);
  }
}

export class BooleanValueObject extends ValueObject<boolean> {
  validate(): void {
    if (typeof this.value !== "boolean") {
      throw new Error("Value must be a boolean");
    }
  }

  static fromBoolean(value: boolean): BooleanValueObject {
    return new BooleanValueObject(value);
  }
}

