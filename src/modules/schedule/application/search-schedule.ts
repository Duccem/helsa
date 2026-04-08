import { PaginatedResult } from "@/modules/shared/domain/query";
import { ScheduleRepository, SearchSchedulesCriteria } from "../domain/schedule-repository";
import { Primitives } from "@/modules/shared/domain/primitives";
import { Schedule } from "../domain/schedule";
import { ApplicationService } from "@/modules/shared/domain/service.";

@ApplicationService()
export class SearchSchedule {
  constructor(private scheduleRepository: ScheduleRepository) {}

  async execute(criteria: SearchSchedulesCriteria): Promise<PaginatedResult<Primitives<Schedule>>> {
    const result = await this.scheduleRepository.searchSchedules(criteria);

    return {
      data: result.data.map((item) => item.toPrimitives()),
      pagination: result.pagination,
    };
  }
}

