import type { PaginatedResult } from "@/modules/shared/domain/query";
import type {
  AppointmentListItem,
  AppointmentRepository,
  AppointmentSearchCriteria,
} from "../domain/appointment-repository";

export class SearchAppointmentsList {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(criteria: AppointmentSearchCriteria): Promise<PaginatedResult<AppointmentListItem>> {
    return await this.repository.searchList(criteria);
  }
}

