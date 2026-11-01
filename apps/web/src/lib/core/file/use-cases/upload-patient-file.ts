import { randomUUID } from "node:crypto";
import type { BetterUser } from "@helsa/auth";
import { validateFile } from "@/components/dashboard/patients/schema";
import { CURRENT_KEY_VERSION, encrypt, sha256 } from "@/lib/infra/clinical-cipher";
import { putObject, removeObject } from "@/lib/infra/file-storage";
import { EnsurePatientAccess } from "../../patient/use-cases/ensure-patient-access";
import { FileRepository } from "../adapters/file-repository";
import { FileRejected } from "../domain/errors";

type UploadPatientFileInput = {
  patientId: string;
  name: string;
  type: string;
  bytes: Buffer;
};

export class UploadPatientFile {
  private repository = new FileRepository();
  private access = new EnsurePatientAccess();

  async execute(data: UploadPatientFileInput, user: BetterUser) {
    const patient = await this.access.execute(data.patientId, user);

    const problem = validateFile({ type: data.type, size: data.bytes.length });
    if (problem) {
      throw new FileRejected(problem);
    }

    const id = randomUUID();
    const storage_key = `${user.id}/${patient.id}/${id}`;

    await putObject(storage_key, encrypt(data.bytes, user.id));

    try {
      await this.repository.create({
        id,
        therapist_id: user.id,
        patient_id: patient.id,
        uploaded_by: user.id,
        storage_key,
        original_name: this.cleanName(data.name),
        mime_type: data.type,
        size_bytes: data.bytes.length,
        sha256: sha256(data.bytes),
        is_encrypted: true,
        enc_key_version: CURRENT_KEY_VERSION,
      });
    } catch (error) {
      // Don't leave an orphan object behind when the row could not be saved.
      await removeObject(storage_key).catch(() => undefined);
      throw error;
    }

    return { id };
  }

  private cleanName(name: string) {
    const clean = name.replace(/[\\/\u0000-\u001f]/g, "_").trim();
    return (clean || "archivo").slice(0, 200);
  }
}
