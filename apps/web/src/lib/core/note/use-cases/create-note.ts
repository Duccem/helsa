import { randomUUID } from "node:crypto";
import type { BetterUser } from "@helsa/auth";
import type { NoteInput } from "@/components/dashboard/patients/schema";
import { CURRENT_KEY_VERSION, encryptText } from "@/lib/infra/clinical-cipher";
import { EnsurePatientAccess } from "../../patient/use-cases/ensure-patient-access";
import { NoteRepository } from "../adapters/note-repository";

type CreateNoteInput = NoteInput & { patientId: string };

export class CreateNote {
  private repository = new NoteRepository();
  private access = new EnsurePatientAccess();

  async execute(data: CreateNoteInput, user: BetterUser) {
    const patient = await this.access.execute(data.patientId, user);
    const id = randomUUID();

    await this.repository.create({
      id,
      therapist_id: user.id,
      patient_id: patient.id,
      title: data.title.trim() || null,
      content_enc: encryptText(data.content, user.id),
      enc_key_version: CURRENT_KEY_VERSION,
      client_id: randomUUID(),
      client_updated_at: new Date(),
    });

    return { id };
  }
}
