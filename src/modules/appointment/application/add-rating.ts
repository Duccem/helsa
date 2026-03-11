import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { AppointmentId } from "../domain/appointment";
import { AppointmentNotFound } from "../domain/appointment-not-found";
import { AppointmentRepository } from "../domain/appointment-repository";

export type AppointmentAddRatingInputDto = {
  appointment_id: string;
  rating: number;
  organization_id: string;
};

export type AppointmentAddRatingErrors = AppointmentNotFound | NotAuthorized;

export class AppointmentAddRating {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(payload: AppointmentAddRatingInputDto): Promise<void> {
    const appointment = await this.repository.find(AppointmentId.fromString(payload.appointment_id));
    if (!appointment) {
      throw new AppointmentNotFound(payload.appointment_id);
    }

    if (appointment.organization_id.getValue() !== payload.organization_id) {
      throw new NotAuthorized(`You are not authorized to add a rating to this appointment`);
    }

    appointment.addRating(payload.rating);
    await this.repository.save(appointment);
  }
}

