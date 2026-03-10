import { InvalidArgument } from "../errors/invalid-argument";
import { ValueObject } from "../value-object";
import { format, isValid } from "date-fns";

export class Timestamp extends ValueObject<Date> {
  validate(): void {
    if (!isValid(this.value)) {
      throw new InvalidArgument({ argument: this.name, value: this.value });
    }
  }

  format(): string {
    return format(this.value, "yyyy-MM-dd HH:mm:ss");
  }

  static now(): Timestamp {
    return new Timestamp(new Date());
  }

  static fromDate(date: Date): Timestamp {
    return new Timestamp(date);
  }
}

