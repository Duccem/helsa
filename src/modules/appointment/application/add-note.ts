import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { AppointmentId } from "../domain/appointment";
import { AppointmentNotFound } from "../domain/appointment-not-found";
import { AppointmentRepository } from "../domain/appointment-repository";
import { ApplicationService } from "@/modules/shared/domain/service.";

export type AddAppointmentNoteInputDTO = {
  appointment_id: string;
  note: string;
};

export type AddAppointmentNoteErrors = AppointmentNotFound | NotAuthorized;

@ApplicationService()
export class AddAppointmentNote {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(payload: AddAppointmentNoteInputDTO): Promise<void> {
    const appointment = await this.repository.find(AppointmentId.fromString(payload.appointment_id));
    if (!appointment) {
      throw new AppointmentNotFound(payload.appointment_id);
    }

    appointment.addNote(payload.note);
    await this.repository.save(appointment);
  }
}

