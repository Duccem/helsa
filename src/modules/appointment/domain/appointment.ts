import { Aggregate } from "@/modules/shared/domain/aggregate";
import { Primitives } from "@/modules/shared/domain/primitives";
import { StringValueObject } from "@/modules/shared/domain/value-object";
import { Enum } from "@/modules/shared/domain/value-objects/enum";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";
import { AppointmentRating } from "./appointment-rating";
import { AppointmentNote } from "./appointment-note";
import { AppointmentAlreadyHasRating } from "./appointment-already-has-rating";

export class AppointmentId extends Uuid {}
export class AppointmentOrganizationId extends Uuid {}
export class AppointmentPatientId extends Uuid {}
export class AppointmentDoctorId extends Uuid {}
export class AppointmentDate extends Timestamp {}
export class AppointmentMotive extends StringValueObject {}
export class AppointmentCreatedAt extends Timestamp {}
export class AppointmentUpdatedAt extends Timestamp {}

export class Appointment extends Aggregate {
  constructor(
    public id: AppointmentId,
    public organization_id: AppointmentOrganizationId,
    public patient_id: AppointmentPatientId,
    public doctor_id: AppointmentDoctorId,
    public date: AppointmentDate,
    public motive: AppointmentMotive,
    public type: AppointmentType,
    public mode: AppointmentMode,
    public status: AppointmentStatus,
    public created_at: AppointmentCreatedAt,
    public updated_at: AppointmentUpdatedAt,
    public rating?: AppointmentRating,
    public notes?: AppointmentNote[],
  ) {
    super();
  }

  toPrimitives(): Primitives<Appointment> {
    return {
      id: this.id.value,
      organization_id: this.organization_id.value,
      patient_id: this.patient_id.value,
      doctor_id: this.doctor_id.value,
      date: this.date.value,
      motive: this.motive.value,
      type: this.type.value,
      mode: this.mode.value,
      status: this.status.value,
      created_at: this.created_at.value,
      updated_at: this.updated_at.value,
      rating: this.rating ? this.rating.toPrimitives() : undefined,
      notes: this.notes ? this.notes.map((note) => note.toPrimitives()) : undefined,
    };
  }

  static fromPrimitives(primitives: Primitives<Appointment>): Appointment {
    return new Appointment(
      AppointmentId.fromString(primitives.id),
      AppointmentOrganizationId.fromString(primitives.organization_id),
      AppointmentPatientId.fromString(primitives.patient_id),
      AppointmentDoctorId.fromString(primitives.doctor_id),
      AppointmentDate.fromDate(primitives.date),
      AppointmentMotive.fromString(primitives.motive),
      AppointmentType.fromString(primitives.type as AppointmentTypeValues),
      AppointmentMode.fromString(primitives.mode as AppointmentModeValues),
      AppointmentStatus.fromString(primitives.status as AppointmentStatusValues),
      AppointmentCreatedAt.fromDate(primitives.created_at),
      AppointmentUpdatedAt.fromDate(primitives.updated_at),
      primitives.rating ? AppointmentRating.fromPrimitives(primitives.rating) : undefined,
      primitives.notes ? primitives.notes.map((note) => AppointmentNote.fromPrimitives(note)) : undefined,
    );
  }

  static create(
    organization_id: string,
    patient_id: string,
    doctor_id: string,
    date: Date,
    motive: string,
    type: string = AppointmentTypeValues.INITIAL,
    mode: string = AppointmentModeValues.ONLINE,
  ): Appointment {
    return new Appointment(
      AppointmentId.generate(),
      AppointmentOrganizationId.fromString(organization_id),
      AppointmentPatientId.fromString(patient_id),
      AppointmentDoctorId.fromString(doctor_id),
      AppointmentDate.fromDate(date),
      AppointmentMotive.fromString(motive),
      AppointmentType.fromString(type),
      AppointmentMode.fromString(mode),
      AppointmentStatus.schedule(),
      AppointmentCreatedAt.now(),
      AppointmentUpdatedAt.now(),
    );
  }

  addRating(score: number): void {
    if (this.rating) {
      throw new AppointmentAlreadyHasRating({ appointmentId: this.id.value });
    }
    this.rating = AppointmentRating.create(this.id.value, this.patient_id.value, this.doctor_id.value, score);
    this.updated_at = AppointmentUpdatedAt.now();
  }

  addNote(content: string): void {
    const note = AppointmentNote.create(this.id.value, content);
    if (!this.notes) {
      this.notes = [];
    }
    this.notes.push(note);
    this.updated_at = AppointmentUpdatedAt.now();
  }

  removeNote(noteId: string): void {
    if (!this.notes) {
      return;
    }
    this.notes = this.notes.filter((note) => note.id.value !== noteId);
    this.updated_at = AppointmentUpdatedAt.now();
  }

  updateStatus(status: AppointmentStatusValues): void {
    this.status = AppointmentStatus.fromString(status);
    this.updated_at = AppointmentUpdatedAt.now();
  }
}

export enum AppointmentTypeValues {
  INITIAL = "INITIAL",
  THERAPY = "THERAPY",
}

export class AppointmentType extends Enum<AppointmentTypeValues> {
  constructor(value: AppointmentTypeValues) {
    super(value, Object.values(AppointmentTypeValues));
  }

  static fromString(value: string): AppointmentType {
    return new AppointmentType(value as AppointmentTypeValues);
  }
}

export enum AppointmentModeValues {
  ONLINE = "ONLINE",
  IN_PERSON = "IN_PERSON",
}

export class AppointmentMode extends Enum<AppointmentModeValues> {
  constructor(value: AppointmentModeValues) {
    super(value, Object.values(AppointmentModeValues));
  }

  static fromString(value: string): AppointmentMode {
    return new AppointmentMode(value as AppointmentModeValues);
  }
}

export enum AppointmentStatusValues {
  SCHEDULED = "SCHEDULED",
  CONFIRMED = "CONFIRMED",
  PAYED = "PAYED",
  READY = "READY",
  STARTED = "STARTED",
  CANCELLED = "CANCELLED",
  MISSED_BY_PATIENT = "MISSED_BY_PATIENT",
  MISSED_BY_THERAPIST = "MISSED_BY_THERAPIST",
  FINISHED = "FINISHED",
}

export class AppointmentStatus extends Enum<AppointmentStatusValues> {
  constructor(value: AppointmentStatusValues) {
    super(value, Object.values(AppointmentStatusValues));
  }

  static fromString(value: string): AppointmentStatus {
    return new AppointmentStatus(value as AppointmentStatusValues);
  }

  static schedule(): AppointmentStatus {
    return new AppointmentStatus(AppointmentStatusValues.SCHEDULED);
  }
}

