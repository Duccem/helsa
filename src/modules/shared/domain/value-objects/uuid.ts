import { v7, validate } from "uuid";
import { ValueObject } from "../value-object";
import { InvalidArgument } from "../errors/invalid-argument";
export class Uuid extends ValueObject<string> {
  validate(): void {
    if (!validate(this.value)) {
      throw new InvalidArgument({ argument: this.name, value: this.value });
    }
  }

  static generate(): Uuid {
    const uuid = v7();
    return new Uuid(uuid);
  }

  static fromString(uuid: string): Uuid {
    return new Uuid(uuid);
  }
}

