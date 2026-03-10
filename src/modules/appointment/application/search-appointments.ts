import { PaginatedResult } from "@/modules/shared/domain/query";
import { Appointment } from "../domain/appointment";
import { AppointmentRepository, AppointmentSearchCriteria } from "../domain/appointment-repository";

export class SearchAppointments {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(criteria: AppointmentSearchCriteria): Promise<PaginatedResult<Appointment>> {
    return await this.repository.search(criteria);
  }
}

