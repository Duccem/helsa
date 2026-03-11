import { Schedule, ScheduleDoctorId } from "../domain/schedule";
import { ScheduleRepository } from "../domain/schedule-repository";

export class GetSchedule {
  constructor(private readonly repository: ScheduleRepository) {}

  async execute(doctor_id: string): Promise<Schedule | null> {
    return await this.repository.findByDoctorId(ScheduleDoctorId.fromString(doctor_id));
  }
}

