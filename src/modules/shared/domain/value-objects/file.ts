import { ValueObject } from "../value-object";

export class File extends ValueObject<string> {
  validate(): void {
    if (!this.value) {
      throw new Error("File cannot be empty");
    }
  }
}

