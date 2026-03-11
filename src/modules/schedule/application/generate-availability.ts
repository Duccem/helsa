import { ScheduleAvailabilityGenerator } from "../domain/schedule-availability-generator";
import { ScheduleAppointmentSource } from "../domain/schedule-appointment-source";
import { ScheduleNotFound } from "../domain/schedule-not-found";
import { ScheduleDoctorId } from "../domain/schedule";
import { ScheduleRepository } from "../domain/schedule-repository";

export class GenerateAvailability {
  constructor(
    private readonly repository: ScheduleRepository,
    private readonly appointmentSource: ScheduleAppointmentSource,
  ) {}

  async execute(doctor_id: string, date_from: Date, date_to: Date): Promise<void> {
    const schedule = await this.repository.findByDoctorId(ScheduleDoctorId.fromString(doctor_id));
    if (!schedule) {
      throw new ScheduleNotFound(doctor_id);
    }

    const appointments = await this.appointmentSource.listByDoctorId(doctor_id, date_from, date_to);
    const slots = ScheduleAvailabilityGenerator.generate(schedule, appointments, date_from, date_to);

    await this.repository.deleteAvailabilitiesByDoctorIdAndRange(
      ScheduleDoctorId.fromString(doctor_id),
      date_from,
      date_to,
    );

    await this.repository.saveAvailabilities(slots);
  }
}

