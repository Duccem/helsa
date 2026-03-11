import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { AppointmentId } from "../domain/appointment";
import { AppointmentNotFound } from "../domain/appointment-not-found";
import { AppointmentRepository } from "../domain/appointment-repository";

export type AddAppointmentNoteInputDTO = {
  appointment_id: string;
  note: string;
  organization_id: string;
};

export type AddAppointmentNoteErrors = AppointmentNotFound | NotAuthorized;

export class AddAppointmentNote {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(payload: AddAppointmentNoteInputDTO): Promise<void> {
    const appointment = await this.repository.find(AppointmentId.fromString(payload.appointment_id));
    if (!appointment) {
      throw new AppointmentNotFound(payload.appointment_id);
    }

    if (appointment.organization_id.getValue() !== payload.organization_id) {
      throw new NotAuthorized(`You are not authorized to add a note to this appointment`);
    }

    appointment.addNote(payload.note);
    await this.repository.save(appointment);
  }
}

