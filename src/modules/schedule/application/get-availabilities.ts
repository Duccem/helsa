import { AvailabilitySlot } from "../domain/availability-slot";
import { ScheduleDoctorId } from "../domain/schedule";
import { ScheduleRepository } from "../domain/schedule-repository";

export class GetAvailabilities {
  constructor(private readonly repository: ScheduleRepository) {}

  async execute(doctor_id: string, date_from?: Date, date_to?: Date): Promise<AvailabilitySlot[]> {
    return await this.repository.findAvailabilitiesByDoctorId(
      ScheduleDoctorId.fromString(doctor_id),
      date_from,
      date_to,
    );
  }
}

