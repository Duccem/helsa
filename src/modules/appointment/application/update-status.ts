import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { AppointmentId, AppointmentStatusValues } from "../domain/appointment";
import { AppointmentNotFound } from "../domain/appointment-not-found";
import { AppointmentRepository } from "../domain/appointment-repository";

export class UpdateAppointmentStatus {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(id: string, status: string, organizationId: string): Promise<void> {
    const appointment = await this.repository.find(AppointmentId.fromString(id));
    if (!appointment) {
      throw new AppointmentNotFound(id);
    }

    if (appointment.organization_id.getValue() !== organizationId) {
      throw new NotAuthorized(`You are not authorized to update this appointment`);
    }

    appointment.updateStatus(status as AppointmentStatusValues);

    await this.repository.save(appointment);
  }
}

