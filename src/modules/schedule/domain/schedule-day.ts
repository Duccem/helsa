import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { Primitives } from "@/modules/shared/domain/primitives";
import { NumberValueObject, StringValueObject } from "@/modules/shared/domain/value-object";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";
import { InvalidScheduleDayRange } from "./invalid-schedule-day-range";

export class ScheduleDayId extends Uuid {}
export class ScheduleDayScheduleId extends Uuid {}

export class ScheduleDayValue extends NumberValueObject {
  override validate(): void {
    super.validate();
    if (this.value < 0 || this.value > 6) {
      throw new InvalidArgument({ argument: this.constructor.name, value: this.value });
    }
  }
}

const hourRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const normalizeHour = (value: string): string => {
  if (!hourRegex.test(value)) {
    throw new InvalidArgument({ argument: "ScheduleDayHour", value });
  }

  const [hour, minute, second] = value.split(":");
  return `${hour}:${minute}:${second ?? "00"}`;
};

export class ScheduleDayStartHour extends StringValueObject {
  override validate(): void {
    super.validate();
    if (!hourRegex.test(this.value)) {
      throw new InvalidArgument({ argument: this.constructor.name, value: this.value });
    }
  }

  static override fromString(value: string): ScheduleDayStartHour {
    return new ScheduleDayStartHour(normalizeHour(value));
  }
}

export class ScheduleDayEndHour extends StringValueObject {
  override validate(): void {
    super.validate();
    if (!hourRegex.test(this.value)) {
      throw new InvalidArgument({ argument: this.constructor.name, value: this.value });
    }
  }

  static override fromString(value: string): ScheduleDayEndHour {
    return new ScheduleDayEndHour(normalizeHour(value));
  }
}

export class ScheduleDay {
  constructor(
    public readonly id: ScheduleDayId,
    public readonly schedule_id: ScheduleDayScheduleId,
    public readonly day: ScheduleDayValue,
    public readonly start_hour: ScheduleDayStartHour,
    public readonly end_hour: ScheduleDayEndHour,
  ) {}

  toPrimitives(): Primitives<ScheduleDay> {
    return {
      id: this.id.value,
      schedule_id: this.schedule_id.value,
      day: this.day.value,
      start_hour: this.start_hour.value,
      end_hour: this.end_hour.value,
    };
  }

  static fromPrimitives(primitives: Primitives<ScheduleDay>): ScheduleDay {
    return new ScheduleDay(
      ScheduleDayId.fromString(primitives.id),
      ScheduleDayScheduleId.fromString(primitives.schedule_id),
      ScheduleDayValue.fromNumber(primitives.day),
      ScheduleDayStartHour.fromString(primitives.start_hour),
      ScheduleDayEndHour.fromString(primitives.end_hour),
    );
  }

  static create(schedule_id: string, day: number, start_hour: string, end_hour: string): ScheduleDay {
    return new ScheduleDay(
      ScheduleDayId.generate(),
      ScheduleDayScheduleId.fromString(schedule_id),
      ScheduleDayValue.fromNumber(day),
      ScheduleDayStartHour.fromString(start_hour),
      ScheduleDayEndHour.fromString(end_hour),
    );
  }
}

export type ScheduleDayInput = {
  day: number;
  start_hour: string;
  end_hour: string;
};

