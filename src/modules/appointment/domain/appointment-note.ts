import { Primitives } from "@/modules/shared/domain/primitives";
import { StringValueObject } from "@/modules/shared/domain/value-object";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";

export class AppointmentNoteId extends Uuid {}
export class AppointmentNoteAppointmentId extends Uuid {}
export class AppointmentNoteNote extends StringValueObject {}
export class AppointmentNoteCreatedAt extends Timestamp {}
export class AppointmentNoteUpdatedAt extends Timestamp {}
export class AppointmentNote {
  constructor(
    public readonly id: AppointmentNoteId,
    public readonly appointment_id: AppointmentNoteAppointmentId,
    public readonly note: AppointmentNoteNote,
    public readonly created_at: AppointmentNoteCreatedAt,
    public readonly updated_at: AppointmentNoteUpdatedAt,
  ) {}

  toPrimitives(): Primitives<AppointmentNote> {
    return {
      id: this.id.value,
      appointment_id: this.appointment_id.value,
      note: this.note.value,
      created_at: this.created_at.value,
      updated_at: this.updated_at.value,
    };
  }

  static fromPrimitives(primitives: Primitives<AppointmentNote>): AppointmentNote {
    return new AppointmentNote(
      new AppointmentNoteId(primitives.id),
      new AppointmentNoteAppointmentId(primitives.appointment_id),
      new AppointmentNoteNote(primitives.note),
      new AppointmentNoteCreatedAt(primitives.created_at),
      new AppointmentNoteUpdatedAt(primitives.updated_at),
    );
  }

  static create(appointment_id: string, note: string): AppointmentNote {
    return new AppointmentNote(
      AppointmentNoteId.generate(),
      new AppointmentNoteAppointmentId(appointment_id),
      new AppointmentNoteNote(note),
      new AppointmentNoteCreatedAt(new Date()),
      new AppointmentNoteUpdatedAt(new Date()),
    );
  }
}

