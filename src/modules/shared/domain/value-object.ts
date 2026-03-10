export abstract class ValueObject<T> {
  public readonly value: T;

  constructor(value: T) {
    this.value = value;
    this.validate();
  }

  equals(other: ValueObject<T>): boolean {
    if (this.value === other.value) return true;
    if (typeof this.value === "object" && typeof other.value === "object") {
      return JSON.stringify(this.value) === JSON.stringify(other.value);
    }
    return false;
  }

  getValue(): T {
    return this.value;
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
}

export class NumberValueObject extends ValueObject<number> {
  validate(): void {
    if (isNaN(this.value)) {
      throw new Error("Value must be a number");
    }
  }
}

export class BooleanValueObject extends ValueObject<boolean> {
  validate(): void {
    if (typeof this.value !== "boolean") {
      throw new Error("Value must be a boolean");
    }
  }
}

