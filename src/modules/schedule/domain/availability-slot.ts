import { Primitives } from "@/modules/shared/domain/primitives";
import { StringValueObject } from "@/modules/shared/domain/value-object";
import { Enum } from "@/modules/shared/domain/value-objects/enum";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";

export class AvailabilitySlotId extends Uuid {}
export class AvailabilitySlotDoctorId extends Uuid {}
export class AvailabilitySlotDate extends Timestamp {}
export class AvailabilitySlotHour extends StringValueObject {
  override validate(): void {
    super.validate();
    const regex = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
    if (!regex.test(this.value)) {
      throw new Error("AvailabilitySlotHour must be in HH:mm:ss format");
    }
  }

  static fromDate(date: Date): AvailabilitySlotHour {
    const hour = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(
      date.getSeconds(),
    ).padStart(2, "0")}`;
    return new AvailabilitySlotHour(hour);
  }
}

export enum AvailabilitySlotStateValues {
  TAKEN = "TAKEN",
  AVAILABLE = "AVAILABLE",
}

export class AvailabilitySlotState extends Enum<AvailabilitySlotStateValues> {
  constructor(value: AvailabilitySlotStateValues) {
    super(value, Object.values(AvailabilitySlotStateValues));
  }

  static fromString(value: string): AvailabilitySlotState {
    return new AvailabilitySlotState(value as AvailabilitySlotStateValues);
  }
}

export class AvailabilitySlotCreatedAt extends Timestamp {}
export class AvailabilitySlotUpdatedAt extends Timestamp {}

export class AvailabilitySlot {
  constructor(
    public readonly id: AvailabilitySlotId,
    public readonly doctor_id: AvailabilitySlotDoctorId,
    public readonly date: AvailabilitySlotDate,
    public readonly hour: AvailabilitySlotHour,
    public readonly state: AvailabilitySlotState,
    public readonly created_at: AvailabilitySlotCreatedAt,
    public readonly updated_at: AvailabilitySlotUpdatedAt,
  ) {}

  toPrimitives(): Primitives<AvailabilitySlot> {
    return {
      id: this.id.value,
      doctor_id: this.doctor_id.value,
      date: this.date.value,
      hour: this.hour.value,
      state: this.state.value,
      created_at: this.created_at.value,
      updated_at: this.updated_at.value,
    };
  }

  static fromPrimitives(primitives: Primitives<AvailabilitySlot>): AvailabilitySlot {
    return new AvailabilitySlot(
      AvailabilitySlotId.fromString(primitives.id),
      AvailabilitySlotDoctorId.fromString(primitives.doctor_id),
      AvailabilitySlotDate.fromDate(primitives.date),
      new AvailabilitySlotHour(primitives.hour),
      AvailabilitySlotState.fromString(primitives.state),
      AvailabilitySlotCreatedAt.fromDate(primitives.created_at),
      AvailabilitySlotUpdatedAt.fromDate(primitives.updated_at),
    );
  }

  static create(
    doctor_id: string,
    date: Date,
    state: AvailabilitySlotStateValues = AvailabilitySlotStateValues.AVAILABLE,
  ): AvailabilitySlot {
    return new AvailabilitySlot(
      AvailabilitySlotId.generate(),
      AvailabilitySlotDoctorId.fromString(doctor_id),
      AvailabilitySlotDate.fromDate(date),
      AvailabilitySlotHour.fromDate(date),
      AvailabilitySlotState.fromString(state),
      AvailabilitySlotCreatedAt.now(),
      AvailabilitySlotUpdatedAt.now(),
    );
  }
}

