import { Hour } from './hour';
import { StringValueObject } from '@helsa/ddd/core/value-object';
import { Primitives } from '@helsa/ddd/types/primitives';

export class Day {
  constructor(public day: StringValueObject, public hours: Hour[]) {}

  public static fromPrimitives(data: Primitives<Day>) {
    return new Day(new StringValueObject(data.day), data.hours.map(Hour.fromPrimitives));
  }

  public static create(day: string, hours: Primitives<Hour>[]): Day {
    return new Day(
      new StringValueObject(day),
      hours.map((hour) => Hour.create(hour.hour))
    );
  }

  public toPrimitives() {
    return {
      day: this.day.value,
      hours: this.hours.map((hour) => hour.toPrimitives()),
    };
  }
}
