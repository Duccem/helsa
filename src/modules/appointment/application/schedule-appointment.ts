import { ApplicationService } from "@/modules/shared/domain/service.";
import { Appointment } from "../domain/appointment";
import { AppointmentRepository } from "../domain/appointment-repository";
import { AppointmentScheduledAtSameTime } from "../domain/appointment-scheduled-at-same-time";

@ApplicationService()
export class ScheduleAppointment {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(
    organization_id: string | null,
    patient_id: string,
    doctor_id: string,
    date: Date,
    hour: string,
    motive: string,
    type: string,
    mode: string,
    amount: number,
    payment_mode: string,
  ): Promise<void> {
    const existingAppointments = await this.repository.search({
      organization_id: organization_id || undefined,
      doctor_id,
      date_from: new Date(date.getTime() - 30 * 60 * 1000), // 30 minutes before
      date_to: new Date(date.getTime() + 30 * 60 * 1000), // 30 minutes after
      hour,
      page: 1,
      pageSize: 1,
    });

    if (existingAppointments.data.length > 0) {
      throw new AppointmentScheduledAtSameTime(doctor_id, date);
    }

    const appointment = Appointment.create(patient_id, doctor_id, date, hour, motive, type, mode, organization_id, {
      amount,
      currency: "USD",
      mode: payment_mode,
    });
    await this.repository.save(appointment);
  }
}

