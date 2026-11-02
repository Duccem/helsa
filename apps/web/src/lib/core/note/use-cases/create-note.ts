import { randomUUID } from "node:crypto";
import type { BetterUser } from "@helsa/auth";
import type { NoteInput } from "@/components/dashboard/patients/schema";
import { CURRENT_KEY_VERSION, encryptText } from "@/lib/infra/clinical-cipher";
import { EnsurePatientAccess } from "../../patient/use-cases/ensure-patient-access";
import { AppointmentRepository } from "../../appointment/adapters/appointment-repository";
import { NoteRepository } from "../adapters/note-repository";
import { NoteSessionMismatch } from "../domain/errors";

type CreateNoteInput = NoteInput & { patientId: string };

export class CreateNote {
  private repository = new NoteRepository();
  private access = new EnsurePatientAccess();
  private appointments = new AppointmentRepository();

  async execute(data: CreateNoteInput, user: BetterUser) {
    const patient = await this.access.execute(data.patientId, user);
    const appointment_id = await this.sessionOf(data.appointmentId, patient.id, user.id);
    const id = randomUUID();

    await this.repository.create({
      id,
      therapist_id: user.id,
      patient_id: patient.id,
      appointment_id,
      title: data.title.trim() || null,
      content_enc: encryptText(data.content, user.id),
      enc_key_version: CURRENT_KEY_VERSION,
      client_id: randomUUID(),
      client_updated_at: new Date(),
    });

    return { id };
  }

  /** The linked session must be one of this patient's appointments. */
  private async sessionOf(appointment_id: string | null | undefined, patient_id: string, therapist_id: string) {
    if (!appointment_id) return null;
    const appointment = await this.appointments.getById(appointment_id, therapist_id);
    if (!appointment || appointment.patient_id !== patient_id) {
      throw new NoteSessionMismatch();
    }
    return appointment.id;
  }
}
