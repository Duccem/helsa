import { Aggregate } from "@/modules/shared/domain/aggregate";
import { DomainEntity } from "@/modules/shared/domain/domain-entity";
import { Primitives } from "@/modules/shared/domain/primitives";
import { StringValueObject } from "@/modules/shared/domain/value-object";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";

export class VideoCallId extends Uuid {}
export class VideoCallAppointmentId extends Uuid {}

export class VideoCall extends Aggregate {
  constructor(
    public id: VideoCallId,
    public appointment_id: VideoCallAppointmentId,
    public doctor?: VideoCallDoctor,
    public patient?: VideoCallPatient,
  ) {
    super(id);
  }

  toPrimitives(): Primitives<VideoCall> {
    return {
      id: this.id.value,
      appointment_id: this.appointment_id.value,
      doctor: this.doctor ? this.doctor.toPrimitives() : undefined,
      patient: this.patient ? this.patient.toPrimitives() : undefined,
    };
  }

  static fromPrimitives(primitives: Primitives<VideoCall>): VideoCall {
    return new VideoCall(
      new VideoCallId(primitives.id),
      new VideoCallAppointmentId(primitives.appointment_id),
      primitives.doctor ? VideoCallDoctor.fromPrimitives(primitives.doctor) : undefined,
      primitives.patient ? VideoCallPatient.fromPrimitives(primitives.patient) : undefined,
    );
  }

  static create(appointment_id: string): VideoCall {
    return new VideoCall(VideoCallId.generate(), new VideoCallAppointmentId(appointment_id));
  }
}

export class VideoCallDoctorId extends Uuid {}
export class VideoCallDoctorName extends StringValueObject {}
export class VideoCallDoctorEmail extends StringValueObject {}
export class VideoCallDoctor extends DomainEntity {
  constructor(
    public id: VideoCallDoctorId,
    public name: VideoCallDoctorName,
    public email: VideoCallDoctorEmail,
  ) {
    super(id);
  }

  toPrimitives(): Primitives<VideoCallDoctor> {
    return {
      id: this.id.value,
      name: this.name.value,
      email: this.email.value,
    };
  }

  static fromPrimitives(primitives: Primitives<VideoCallDoctor>): VideoCallDoctor {
    return new VideoCallDoctor(
      new VideoCallDoctorId(primitives.id),
      new VideoCallDoctorName(primitives.name),
      new VideoCallDoctorEmail(primitives.email),
    );
  }
}

export class VideoCallPatientId extends Uuid {}
export class VideoCallPatientName extends StringValueObject {}
export class VideoCallPatientEmail extends StringValueObject {}
export class VideoCallPatient extends DomainEntity {
  constructor(
    public id: VideoCallPatientId,
    public name: VideoCallPatientName,
    public email: VideoCallPatientEmail,
  ) {
    super(id);
  }

  toPrimitives(): Primitives<VideoCallPatient> {
    return {
      id: this.id.value,
      name: this.name.value,
      email: this.email.value,
    };
  }

  static fromPrimitives(primitives: Primitives<VideoCallPatient>): VideoCallPatient {
    return new VideoCallPatient(
      new VideoCallPatientId(primitives.id),
      new VideoCallPatientName(primitives.name),
      new VideoCallPatientEmail(primitives.email),
    );
  }
}

