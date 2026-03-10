import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { AppointmentId } from "../domain/appointment";
import { AppointmentNotFound } from "../domain/appointment-not-found";
import { AppointmentRepository } from "../domain/appointment-repository";

export class AppointmentAddRating {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(appointmentId: string, rating: number, organization_id: string): Promise<void> {
    const appointment = await this.repository.find(AppointmentId.fromString(appointmentId));
    if (!appointment) {
      throw new AppointmentNotFound(appointmentId);
    }

    if (appointment.organization_id.getValue() !== organization_id) {
      throw new NotAuthorized(`You are not authorized to add a rating to this appointment`);
    }

    appointment.addRating(rating);
    await this.repository.save(appointment);
  }
}

