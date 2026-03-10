import { Appointment } from "../domain/appointment";
import { AppointmentRepository } from "../domain/appointment-repository";
import { AppointmentScheduledAtSameTime } from "../domain/appointment-scheduled-at-same-time";

export class ScheduleAppointment {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(
    patient_id: string,
    doctor_id: string,
    date: Date,
    motive: string,
    type: string,
    mode: string,
  ): Promise<void> {
    const existingAppointments = await this.repository.search({
      doctor_id,
      date_from: new Date(date.getTime() - 30 * 60 * 1000), // 30 minutes before
      date_to: new Date(date.getTime() + 30 * 60 * 1000), // 30 minutes after
    });

    if (existingAppointments.length > 0) {
      throw new AppointmentScheduledAtSameTime(doctor_id, date);
    }

    const appointment = Appointment.create(patient_id, doctor_id, date, motive, type, mode);
    await this.repository.save(appointment);
  }
}

