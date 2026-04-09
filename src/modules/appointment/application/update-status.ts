import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { AppointmentId, AppointmentStatusValues } from "../domain/appointment";
import { AppointmentNotFound } from "../domain/appointment-not-found";
import { AppointmentRepository } from "../domain/appointment-repository";

export class UpdateAppointmentStatus {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(id: string, status: string): Promise<void> {
    const appointment = await this.repository.find(AppointmentId.fromString(id));
    if (!appointment) {
      throw new AppointmentNotFound(id);
    }

    appointment.updateStatus(status as AppointmentStatusValues);

    await this.repository.save(appointment);
  }
}

