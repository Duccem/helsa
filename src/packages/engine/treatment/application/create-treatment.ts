import { Primitives } from '@helsa/ddd/types/primitives';
import { Treatment } from '../domain/treatment';
import { TreatmentRepository } from '../domain/treatment-repository';

export class CreateTreatment {
  constructor(private readonly repository: TreatmentRepository) {}

  async run(data: Primitives<Treatment>) {
    const treatment = Treatment.create(
      data.id,
      data.description,
      data.type,
      data.status,
      data.startDate,
      data.endDate,
      data.patientId,
      data.doctorId,
      data.appointmentId,
      data.type === 'MEDICATION' ? data.medication : data.type === 'THERAPY' ? data.therapy : data.procedure
    );

    await this.repository.save(treatment);
  }
}
