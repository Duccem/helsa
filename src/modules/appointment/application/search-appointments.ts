import { PaginatedResult } from "@/modules/shared/domain/query";
import { Appointment } from "../domain/appointment";
import { AppointmentRepository, AppointmentSearchCriteria } from "../domain/appointment-repository";
import { Primitives } from "@/modules/shared/domain/primitives";

export class SearchAppointments {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(criteria: AppointmentSearchCriteria): Promise<PaginatedResult<Primitives<Appointment>>> {
    const response = await this.repository.search(criteria);

    return {
      data: response.data.map((item) => item.toPrimitives()),
      pagination: response.pagination,
    };
  }
}

