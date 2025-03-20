import { Criteria, Operator } from '@helsa/ddd/core/criteria';
import { Primitives } from '@helsa/ddd/types/primitives';
import { Doctor } from '../../domain/doctor';
import { DoctorRepository } from '../../domain/doctor-repository';

export class GetDoctor {
  constructor(private readonly doctorRepository: DoctorRepository) {}

  async run(id: string, field = 'userId'): Promise<Primitives<Doctor> | null> {
    const doctor = await this.doctorRepository.getByCriteria(
      Criteria.fromValues([{ field, value: id, operator: Operator.EQUAL }], undefined, undefined, [
        { field: 'consultingRoomAddress' },
        { field: 'educations' },
        { field: 'schedule' },
        { field: 'specialty' },
        { field: 'prices' },
        { field: 'user' },
      ]),
    );

    if (!doctor) {
      return null;
    }

    return doctor.toPrimitives();
  }
}
