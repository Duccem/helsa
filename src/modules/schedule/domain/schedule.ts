import { Aggregate } from "@/modules/shared/domain/aggregate";
import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { Primitives } from "@/modules/shared/domain/primitives";
import { NumberValueObject } from "@/modules/shared/domain/value-object";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";
import { ScheduleDay, ScheduleDayInput } from "./schedule-day";
import { addDays } from "date-fns";

export class ScheduleId extends Uuid {}
export class ScheduleDoctorId extends Uuid {}
export class ScheduleCreatedAt extends Timestamp {}
export class ScheduleUpdatedAt extends Timestamp {}
export class NextAvailabilityGeneration extends Timestamp {}

export class ScheduleAppointmentDuration extends NumberValueObject {
  override validate(): void {
    super.validate();
    if (this.value <= 0) {
      throw new InvalidArgument({ argument: this.constructor.name, value: this.value });
    }
  }
}

export class ScheduleMaxAppointmentsPerDay extends NumberValueObject {
  override validate(): void {
    super.validate();
    if (this.value <= 0) {
      throw new InvalidArgument({ argument: this.constructor.name, value: this.value });
    }
  }
}

export class Schedule extends Aggregate {
  constructor(
    public id: ScheduleId,
    public doctor_id: ScheduleDoctorId,
    public appointment_duration: ScheduleAppointmentDuration,
    public max_appointments_per_day: ScheduleMaxAppointmentsPerDay,
    public next_availability_generation: NextAvailabilityGeneration,
    public created_at: ScheduleCreatedAt,
    public updated_at: ScheduleUpdatedAt,
    public days?: ScheduleDay[],
  ) {
    super(id);
  }

  toPrimitives(): Primitives<Schedule> {
    return {
      id: this.id.value,
      doctor_id: this.doctor_id.value,
      appointment_duration: this.appointment_duration.value,
      max_appointments_per_day: this.max_appointments_per_day.value,
      next_availability_generation: this.next_availability_generation.value,
      created_at: this.created_at.value,
      updated_at: this.updated_at.value,
      days: this.days?.map((item) => item.toPrimitives()),
    };
  }

  static fromPrimitives(primitives: Primitives<Schedule>): Schedule {
    return new Schedule(
      ScheduleId.fromString(primitives.id),
      ScheduleDoctorId.fromString(primitives.doctor_id),
      ScheduleAppointmentDuration.fromNumber(primitives.appointment_duration),
      ScheduleMaxAppointmentsPerDay.fromNumber(primitives.max_appointments_per_day),
      NextAvailabilityGeneration.fromDate(primitives.next_availability_generation),
      ScheduleCreatedAt.fromDate(primitives.created_at),
      ScheduleUpdatedAt.fromDate(primitives.updated_at),
      primitives.days?.map((item) => ScheduleDay.fromPrimitives(item)),
    );
  }

  static create(
    doctor_id: string,
    appointment_duration: number,
    max_appointments_per_day: number,
    days: ScheduleDayInput[],
  ): Schedule {
    const schedule = new Schedule(
      ScheduleId.generate(),
      ScheduleDoctorId.fromString(doctor_id),
      ScheduleAppointmentDuration.fromNumber(appointment_duration),
      ScheduleMaxAppointmentsPerDay.fromNumber(max_appointments_per_day),
      NextAvailabilityGeneration.fromDate(addDays(new Date(), 1)), // Set initial next availability generation to 7 days from now
      ScheduleCreatedAt.now(),
      ScheduleUpdatedAt.now(),
      [],
    );

    schedule.setDays(days, true);

    return schedule;
  }

  setDays(days: ScheduleDayInput[], deletePrevious: boolean): void {
    const incomingDays = days.map((item) =>
      ScheduleDay.create(this.id.value, item.day, item.start_hour, item.end_hour),
    );

    if (deletePrevious || !this.days) {
      this.days = incomingDays;
      this.updated_at = ScheduleUpdatedAt.now();
      return;
    }

    const daysByDay = new Map<number, ScheduleDay>(this.days.map((item) => [item.day.value, item]));
    for (const day of incomingDays) {
      daysByDay.set(day.day.value, day);
    }

    this.days = [...daysByDay.values()];
    this.updated_at = ScheduleUpdatedAt.now();
  }

  updateNextAvailabilityGeneration(nextGeneration: Date): void {
    this.next_availability_generation = NextAvailabilityGeneration.fromDate(nextGeneration);
    this.updated_at = ScheduleUpdatedAt.now();
  }
}

