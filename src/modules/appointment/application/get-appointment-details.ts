import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { AppointmentId } from "../domain/appointment";
import { AppointmentNotFound } from "../domain/appointment-not-found";
import { AppointmentRepository } from "../domain/appointment-repository";

export class GetAppointmentDetails {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(appointmentId: string) {
    const appointment = await this.repository.find(AppointmentId.fromString(appointmentId));
    if (!appointment) {
      throw new AppointmentNotFound(appointmentId);
    }
    // TODO: Check if the user that wanna access the appointment is the patient or the doctor of the appointment
    // or the admin of the organization
    return appointment;
  }
}

