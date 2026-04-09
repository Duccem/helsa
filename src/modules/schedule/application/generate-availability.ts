import { ScheduleAvailabilityGenerator } from "../domain/schedule-availability-generator";
import { ScheduleNotFound } from "../domain/schedule-not-found";
import { ScheduleDoctorId } from "../domain/schedule";
import { ScheduleRepository } from "../domain/schedule-repository";
import { addMonths } from "date-fns";

export class GenerateAvailability {
  constructor(private readonly repository: ScheduleRepository) {}

  async execute(doctor_id: string): Promise<void> {
    const schedule = await this.repository.findByDoctorId(ScheduleDoctorId.fromString(doctor_id));
    if (!schedule) {
      throw new ScheduleNotFound(doctor_id);
    }

    const { date_from, date_to } = ScheduleAvailabilityGenerator.getNextMonthRange();
    const slots = await this.repository.findAvailabilitiesByDoctorId(
      ScheduleDoctorId.fromString(doctor_id),
      date_from,
      date_to,
    );
    const { take_count_per_day, taken_key_set } = ScheduleAvailabilityGenerator.indexTakenAvailabilities(slots);
    const newSlots = ScheduleAvailabilityGenerator.generate(
      schedule,
      take_count_per_day,
      taken_key_set,
      date_from,
      date_to,
    );
    await this.repository.deleteAvailabilitiesByDoctorIdAndRange(
      ScheduleDoctorId.fromString(doctor_id),
      date_from,
      date_to,
      "AVAILABLE",
    );
    await this.repository.saveAvailabilities(newSlots);
    schedule.updateNextAvailabilityGeneration(addMonths(new Date(), 1));
    await this.repository.save(schedule);
  }
}

