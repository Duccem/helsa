import { Meta } from '@helsa/ddd/core/collection.';
import { Criteria, Direction } from '@helsa/ddd/core/criteria';
import { Primitives } from '@helsa/ddd/types/primitives';
import { Appointment } from '../domain/appointment';
import {
  AppointmentFilter,
  AppointmentPagination,
  AppointmentSort,
  transformFiltersToCriteria,
} from '../domain/appointment-criteria';
import { AppointmentRepository } from '../domain/appointment-repository';

export class GetAppointments {
  constructor(private repository: AppointmentRepository) {}

  async run(
    filters: AppointmentFilter,
    pagination?: AppointmentPagination,
    sort?: AppointmentSort
  ): Promise<{ data: Primitives<Appointment>[]; meta: Meta }> {
    const criteria = Criteria.empty();
    criteria.and(transformFiltersToCriteria(filters));
    criteria.paginate(pagination?.pageSize ?? 10, pagination?.page ?? 0);

    if (sort && sort.order && sort.sortBy) {
      criteria.orderBy(sort.sortBy, sort.order as Direction);
    } else {
      criteria.orderBy('day', Direction.DESC);
    }
    const response = await this.repository.search(criteria);
    return {
      data: response.getItems().map((appointment) => appointment.toPrimitives()),
      meta: response.getMeta(),
    };
  }
}
