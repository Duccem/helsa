import { ScheduleAlreadyExists } from "../domain/schedule-already-exists";
import { ScheduleDayInput } from "../domain/schedule-day";
import { Schedule, ScheduleDoctorId } from "../domain/schedule";
import { ScheduleRepository } from "../domain/schedule-repository";

export class CreateSchedule {
  constructor(private readonly repository: ScheduleRepository) {}

  async execute(
    doctor_id: string,
    appointment_duration: number,
    max_appointments_per_day: number,
    days: ScheduleDayInput[],
  ): Promise<void> {
    const existingSchedule = await this.repository.findByDoctorId(ScheduleDoctorId.fromString(doctor_id));
    if (existingSchedule) {
      throw new ScheduleAlreadyExists(doctor_id);
    }

    const schedule = Schedule.create(doctor_id, appointment_duration, max_appointments_per_day, days);
    await this.repository.save(schedule);
  }
}

