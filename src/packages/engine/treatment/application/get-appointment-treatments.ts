import { Criteria, Operator } from '@helsa/ddd/core/criteria';
import { TreatmentRepository } from '../domain/treatment-repository';

export class GetAppointmentTreatments {
  constructor(private readonly repository: TreatmentRepository) {}

  async run(appointmentId: string) {
    const treatments = await this.repository.search(
      Criteria.fromValues([{ field: 'appointmentId', operator: Operator.EQUAL, value: appointmentId }])
    );

    return treatments.map((treatment) => treatment.toPrimitives());
  }
}
