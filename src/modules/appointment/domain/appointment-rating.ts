import { Primitives } from "@/modules/shared/domain/primitives";
import { NumberValueObject } from "@/modules/shared/domain/value-object";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";

export class AppointmentRatingId extends Uuid {}
export class AppointmentRatingAppointmentId extends Uuid {}
export class AppointmentRatingPatientId extends Uuid {}
export class AppointmentRatingDoctorId extends Uuid {}
export class AppointmentRatingScore extends NumberValueObject {}
export class AppointmentRatingCreatedAt extends Timestamp {}
export class AppointmentRatingUpdatedAt extends Timestamp {}

export class AppointmentRating {
  constructor(
    public readonly id: AppointmentRatingId,
    public readonly appointment_id: AppointmentRatingAppointmentId,
    public readonly patient_id: AppointmentRatingPatientId,
    public readonly doctor_id: AppointmentRatingDoctorId,
    public readonly score: AppointmentRatingScore,
    public readonly created_at: AppointmentRatingCreatedAt,
    public readonly updated_at: AppointmentRatingUpdatedAt,
  ) {}

  toPrimitives(): Primitives<AppointmentRating> {
    return {
      id: this.id.value,
      appointment_id: this.appointment_id.value,
      patient_id: this.patient_id.value,
      doctor_id: this.doctor_id.value,
      score: this.score.value,
      created_at: this.created_at.value,
      updated_at: this.updated_at.value,
    };
  }

  static fromPrimitives(primitives: Primitives<AppointmentRating>): AppointmentRating {
    return new AppointmentRating(
      new AppointmentRatingId(primitives.id),
      new AppointmentRatingAppointmentId(primitives.appointment_id),
      new AppointmentRatingPatientId(primitives.patient_id),
      new AppointmentRatingDoctorId(primitives.doctor_id),
      new AppointmentRatingScore(primitives.score),
      new AppointmentRatingCreatedAt(primitives.created_at),
      new AppointmentRatingUpdatedAt(primitives.updated_at),
    );
  }

  static create(appointment_id: string, patient_id: string, doctor_id: string, score: number): AppointmentRating {
    return new AppointmentRating(
      AppointmentRatingId.generate(),
      new AppointmentRatingAppointmentId(appointment_id),
      new AppointmentRatingPatientId(patient_id),
      new AppointmentRatingDoctorId(doctor_id),
      new AppointmentRatingScore(score),
      new AppointmentRatingCreatedAt(new Date()),
      new AppointmentRatingUpdatedAt(new Date()),
    );
  }
}

