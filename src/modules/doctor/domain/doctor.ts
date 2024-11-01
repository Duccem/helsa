import { Aggregate } from '@/modules/shared/domain/core/aggregate';
import { DateValueObject, NumberValueObject, StringValueObject } from '@/modules/shared/domain/core/value-object';
import { Uuid } from '@/modules/shared/domain/core/value-objects/uuid';
import { Primitives } from '@/modules/shared/domain/types/primitives';
import { ConsultingRoomAddress } from './consulting-room-address';
import { Education } from './educations';
import { Schedule } from './schedule';

export class Doctor extends Aggregate {
  constructor(
    id: Uuid,
    public userId: Uuid,
    public licenseMedicalNumber: StringValueObject,
    public specialtyId: Uuid,
    public score: NumberValueObject,
    public experience: NumberValueObject,
    createdAt: DateValueObject,
    updatedAt: DateValueObject,
    public schedule?: Schedule,
    public consultingRoomAddress?: ConsultingRoomAddress,
    public educations?: Education[]
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, userId: string, licenseMedicalNumber?: string, specialtyId?: string): Doctor {
    return new Doctor(
      new Uuid(id),
      new Uuid(userId),
      new StringValueObject(licenseMedicalNumber),
      new Uuid(specialtyId),
      new NumberValueObject(0),
      new NumberValueObject(1),
      DateValueObject.today(),
      DateValueObject.today()
    );
  }

  static fromPrimitives(data: Primitives<Doctor>): Doctor {
    return new Doctor(
      new Uuid(data.id),
      new Uuid(data.userId),
      new StringValueObject(data.licenseMedicalNumber),
      new Uuid(data.specialtyId),
      new NumberValueObject(data.score),
      new NumberValueObject(data.experience),
      new DateValueObject(data.createdAt),
      new DateValueObject(data.updatedAt),
      data.schedule ? Schedule.fromPrimitives(data.schedule) : undefined,
      data.consultingRoomAddress ? ConsultingRoomAddress.fromPrimitives(data.consultingRoomAddress) : undefined,
      data.educations
        ? data.educations.map((education: Primitives<Education>) => Education.fromPrimitives(education))
        : []
    );
  }

  toPrimitives() {
    return {
      id: this.id.value,
      userId: this.userId.value,
      licenseMedicalNumber: this.licenseMedicalNumber.value,
      specialtyId: this.specialtyId.value,
      score: this.score.value,
      experience: this.experience.value,
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value,
      schedule: this.schedule ? this.schedule.toPrimitives() : undefined,
      consultingRoomAddress: this.consultingRoomAddress ? this.consultingRoomAddress.toPrimitives() : undefined,
      educations: this.educations ? this.educations.map((education) => education.toPrimitives()) : [],
    };
  }
}
