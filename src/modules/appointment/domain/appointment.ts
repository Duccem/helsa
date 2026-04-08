import { Aggregate } from "@/modules/shared/domain/aggregate";
import { Primitives } from "@/modules/shared/domain/primitives";
import { StringValueObject } from "@/modules/shared/domain/value-object";
import { Enum } from "@/modules/shared/domain/value-objects/enum";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";
import { AppointmentRating } from "./appointment-rating";
import { AppointmentNote } from "./appointment-note";
import { AppointmentAlreadyHasRating } from "./appointment-already-has-rating";
import { AppointmentPatient } from "./appointment-patient";
import { AppointmentPayment } from "./appointment-payment";
import { AppointmentScheduledDomainEvent } from "./appointment-scheduled-domain-event";
import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";

const hourRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const normalizeHour = (value: string): string => {
  if (!hourRegex.test(value)) {
    throw new InvalidArgument({ argument: "AppointmentHour", value });
  }

  const [hour, minute, second] = value.split(":");
  return `${hour}:${minute}:${second ?? "00"}`;
};

export class AppointmentId extends Uuid {}
export class AppointmentOrganizationId extends Uuid {}
export class AppointmentPatientId extends Uuid {}
export class AppointmentDoctorId extends Uuid {}
export class AppointmentDate extends Timestamp {}
export class AppointmentMotive extends StringValueObject {}
export class AppointmentCreatedAt extends Timestamp {}
export class AppointmentUpdatedAt extends Timestamp {}
export class AppointmentHour extends StringValueObject {
  override validate(): void {
    super.validate();
    if (!hourRegex.test(this.value)) {
      throw new InvalidArgument({ argument: this.constructor.name, value: this.value });
    }
  }

  static override fromString(value: string): AppointmentHour {
    return new AppointmentHour(normalizeHour(value));
  }
}

export class Appointment extends Aggregate {
  constructor(
    public id: AppointmentId,
    public organization_id: AppointmentOrganizationId | null,
    public patient_id: AppointmentPatientId,
    public doctor_id: AppointmentDoctorId,
    public date: AppointmentDate,
    public hour: AppointmentHour,
    public motive: AppointmentMotive,
    public type: AppointmentType,
    public mode: AppointmentMode,
    public status: AppointmentStatus,
    public created_at: AppointmentCreatedAt,
    public updated_at: AppointmentUpdatedAt,
    public rating?: AppointmentRating,
    public notes?: AppointmentNote[],
    public patient?: AppointmentPatient,
    public payment?: AppointmentPayment,
  ) {
    super(id);
  }

  toPrimitives(): Primitives<Appointment> {
    return {
      id: this.id.value,
      organization_id: this.organization_id ? this.organization_id.value : null,
      patient_id: this.patient_id.value,
      doctor_id: this.doctor_id.value,
      date: this.date.value,
      hour: this.hour.value,
      motive: this.motive.value,
      type: this.type.value,
      mode: this.mode.value,
      status: this.status.value,
      created_at: this.created_at.value,
      updated_at: this.updated_at.value,
      rating: this.rating ? this.rating.toPrimitives() : undefined,
      notes: this.notes ? this.notes.map((note) => note.toPrimitives()) : undefined,
      patient: this.patient ? this.patient.toPrimitives() : undefined,
      payment: this.payment ? this.payment.toPrimitives() : undefined,
    };
  }

  static fromPrimitives(primitives: Primitives<Appointment>): Appointment {
    return new Appointment(
      AppointmentId.fromString(primitives.id),
      primitives.organization_id ? AppointmentOrganizationId.fromString(primitives.organization_id) : null,
      AppointmentPatientId.fromString(primitives.patient_id),
      AppointmentDoctorId.fromString(primitives.doctor_id),
      AppointmentDate.fromDate(primitives.date),
      AppointmentHour.fromString(primitives.hour),
      AppointmentMotive.fromString(primitives.motive),
      AppointmentType.fromString(primitives.type as AppointmentTypeValues),
      AppointmentMode.fromString(primitives.mode as AppointmentModeValues),
      AppointmentStatus.fromString(primitives.status as AppointmentStatusValues),
      AppointmentCreatedAt.fromDate(primitives.created_at),
      AppointmentUpdatedAt.fromDate(primitives.updated_at),
      primitives.rating ? AppointmentRating.fromPrimitives(primitives.rating) : undefined,
      primitives.notes ? primitives.notes.map((note) => AppointmentNote.fromPrimitives(note)) : undefined,
      primitives.patient ? AppointmentPatient.fromPrimitives(primitives.patient) : undefined,
      primitives.payment ? AppointmentPayment.fromPrimitives(primitives.payment) : undefined,
    );
  }

  static create(
    patient_id: string,
    doctor_id: string,
    date: Date,
    hour: string,
    motive: string,
    type: string = AppointmentTypeValues.CONSULTATION,
    mode: string = AppointmentModeValues.ONLINE,
    organization_id: string | null = null,
    payment?: { amount: number; currency: string; mode: string },
  ): Appointment {
    const appointment = new Appointment(
      AppointmentId.generate(),
      organization_id ? AppointmentOrganizationId.fromString(organization_id) : null,
      AppointmentPatientId.fromString(patient_id),
      AppointmentDoctorId.fromString(doctor_id),
      AppointmentDate.fromDate(date),
      AppointmentHour.fromString(hour),
      AppointmentMotive.fromString(motive),
      AppointmentType.fromString(type),
      AppointmentMode.fromString(mode),
      AppointmentStatus.schedule(),
      AppointmentCreatedAt.now(),
      AppointmentUpdatedAt.now(),
    );

    if (payment) {
      appointment.payment = AppointmentPayment.create(
        appointment.id.value,
        payment.amount,
        payment.currency,
        payment.mode,
      );
    }

    appointment.record(
      new AppointmentScheduledDomainEvent(appointment.id.value, {
        appointment_id: appointment.id.value,
        organization_id: appointment.organization_id ? appointment.organization_id.value : null,
        patient_id: appointment.patient_id.value,
        doctor_id: appointment.doctor_id.value,
        date: appointment.date.value,
        hour: appointment.hour.value,
        motive: appointment.motive.value,
        type: appointment.type.value,
        mode: appointment.mode.value,
        status: appointment.status.value,
      }),
    );

    return appointment;
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
  CONSULTATION = "CONSULTATION",
  FOLLOW_UP = "FOLLOW_UP",
  CHECK_UP = "CHECK_UP",
  EMERGENCY = "EMERGENCY",
  PROCEDURE = "PROCEDURE",
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
  IN_PROGRESS = "IN_PROGRESS",
  CANCELLED = "CANCELLED",
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

