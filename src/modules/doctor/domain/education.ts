import { Primitives } from "@/modules/shared/domain/primitives";
import { StringValueObject } from "@/modules/shared/domain/value-object";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";

export class EducationId extends Uuid {}
export class EducationDoctorId extends Uuid {}
export class EducationTitle extends StringValueObject {}
export class EducationInstitution extends StringValueObject {}
export class EducationGraduatedAt extends Timestamp {}
export class EducationCreatedAt extends Timestamp {}
export class EducationUpdatedAt extends Timestamp {}

export class Education {
  constructor(
    public readonly id: EducationId,
    public readonly doctor_id: EducationDoctorId,
    public readonly title: EducationTitle,
    public readonly institution: EducationInstitution,
    public readonly graduated_at: EducationGraduatedAt,
    public readonly created_at: EducationCreatedAt,
    public readonly updated_at: EducationUpdatedAt,
  ) {}

  toPrimitives(): Primitives<Education> {
    return {
      id: this.id.value,
      doctor_id: this.doctor_id.value,
      title: this.title.value,
      institution: this.institution.value,
      graduated_at: this.graduated_at.value,
      created_at: this.created_at.value,
      updated_at: this.updated_at.value,
    };
  }

  static fromPrimitives(primitives: Primitives<Education>): Education {
    return new Education(
      EducationId.fromString(primitives.id),
      EducationDoctorId.fromString(primitives.doctor_id),
      EducationTitle.fromString(primitives.title),
      EducationInstitution.fromString(primitives.institution),
      EducationGraduatedAt.fromDate(primitives.graduated_at),
      EducationCreatedAt.fromDate(primitives.created_at),
      EducationUpdatedAt.fromDate(primitives.updated_at),
    );
  }

  static create(doctor_id: string, title: string, institution: string, graduated_at: Date): Education {
    return new Education(
      EducationId.generate(),
      EducationDoctorId.fromString(doctor_id),
      EducationTitle.fromString(title),
      EducationInstitution.fromString(institution),
      EducationGraduatedAt.fromDate(graduated_at),
      EducationCreatedAt.now(),
      EducationUpdatedAt.now(),
    );
  }
}

