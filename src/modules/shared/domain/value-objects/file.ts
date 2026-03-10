import { InvalidArgument } from "../errors/invalid-argument";
import { ValueObject } from "../value-object";

export class File extends ValueObject<string> {
  validate(): void {
    if (!this.value) {
      throw new InvalidArgument({ argument: this.name, value: this.value });
    }
  }

  fromString(value: string): File {
    return new File(value);
  }
}

