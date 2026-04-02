import { AppointmentId } from "../domain/appointment";
import { AppointmentNotFound } from "../domain/appointment-not-found";
import { AppointmentNoteId } from "../domain/appointment-note";
import { AppointmentRepository } from "../domain/appointment-repository";

export class RemoveAppointmentNote {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(appointment_id: string, note_id: string): Promise<void> {
    const appointment = await this.repository.find(AppointmentId.fromString(appointment_id));
    if (!appointment) {
      throw new AppointmentNotFound(appointment_id);
    }

    await this.repository.removeNote(AppointmentId.fromString(appointment_id), AppointmentNoteId.fromString(note_id));
  }
}

