import { ScheduleDayInput } from "../domain/schedule-day";
import { ScheduleNotFound } from "../domain/schedule-not-found";
import { ScheduleDoctorId } from "../domain/schedule";
import { ScheduleRepository } from "../domain/schedule-repository";

export class AddDaysToSchedule {
  constructor(private readonly repository: ScheduleRepository) {}

  async execute(doctor_id: string, days: ScheduleDayInput[], delete_previous: boolean = true): Promise<void> {
    const schedule = await this.repository.findByDoctorId(ScheduleDoctorId.fromString(doctor_id));
    if (!schedule) {
      throw new ScheduleNotFound(doctor_id);
    }

    schedule.setDays(days, delete_previous);
    await this.repository.save(schedule);
  }
}

