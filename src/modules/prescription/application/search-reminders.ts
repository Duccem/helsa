import { PaginatedResult } from "@/modules/shared/domain/query";
import { PrescriptionRepository, ReminderSearchCriteria } from "../domain/prescription-repository";
import { MedicationReminder } from "../domain/medication-reminder";
import { Primitives } from "@/modules/shared/domain/primitives";

export class SearchReminders {
  constructor(private prescriptionRepository: PrescriptionRepository) {}

  async execute(criteria: ReminderSearchCriteria): Promise<PaginatedResult<Primitives<MedicationReminder>>> {
    const result = await this.prescriptionRepository.searchReminders(criteria);

    return {
      data: result.data.map((r) => r.toPrimitives()),
      pagination: result.pagination,
    };
  }
}

