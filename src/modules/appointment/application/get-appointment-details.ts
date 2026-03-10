import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { AppointmentId } from "../domain/appointment";
import { AppointmentNotFound } from "../domain/appointment-not-found";
import { AppointmentRepository } from "../domain/appointment-repository";

export class GetAppointmentDetails {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(appointmentId: string, organizationId: string) {
    const appointment = await this.repository.find(AppointmentId.fromString(appointmentId));
    if (!appointment) {
      throw new AppointmentNotFound(appointmentId);
    }

    if (appointment.organization_id.getValue() !== organizationId) {
      throw new NotAuthorized("You are not authorized to access this appointment.");
    }
    return appointment;
  }
}

