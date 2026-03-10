import { v7, validate } from "uuid";
import { ValueObject } from "../value-object";
export class Uuid extends ValueObject<string> {
  validate(): void {
    if (!validate(this.value)) {
      throw new Error(`Invalid UUID: ${this.value}`);
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

