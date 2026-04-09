import { Primitives } from "@/modules/shared/domain/primitives";
import { Schedule, ScheduleDoctorId } from "../domain/schedule";
import { ScheduleNotFound } from "../domain/schedule-not-found";
import { ScheduleRepository } from "../domain/schedule-repository";

export class GetSchedule {
  constructor(private readonly repository: ScheduleRepository) {}

  async execute(doctor_id: string): Promise<Primitives<Schedule>> {
    const schedule = await this.repository.findByDoctorId(ScheduleDoctorId.fromString(doctor_id));

    if (!schedule) {
      throw new ScheduleNotFound(doctor_id);
    }

    return schedule.toPrimitives();
  }
}

