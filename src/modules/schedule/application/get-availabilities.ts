import { Primitives } from "@/modules/shared/domain/primitives";
import { AvailabilitySlot } from "../domain/availability-slot";
import { ScheduleDoctorId } from "../domain/schedule";
import { ScheduleRepository } from "../domain/schedule-repository";
import { ApplicationService } from "@/modules/shared/domain/service.";

@ApplicationService()
export class GetAvailabilities {
  constructor(private readonly repository: ScheduleRepository) {}

  async execute(
    doctor_id: string,
    date_from?: Date,
    date_to?: Date,
    state?: string,
  ): Promise<Primitives<AvailabilitySlot>[]> {
    const slots = await this.repository.findAvailabilitiesByDoctorId(
      ScheduleDoctorId.fromString(doctor_id),
      date_from,
      date_to,
      state as "TAKEN" | "AVAILABLE",
    );

    return slots.map((slot) => slot.toPrimitives());
  }
}

