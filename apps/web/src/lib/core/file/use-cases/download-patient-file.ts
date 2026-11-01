import type { BetterUser } from "@helsa/auth";
import { isUuid } from "@/lib/utils/is-uuid";
import { decrypt } from "@/lib/infra/clinical-cipher";
import { getObject } from "@/lib/infra/file-storage";
import { EnsurePatientAccess } from "../../patient/use-cases/ensure-patient-access";
import { FileRepository } from "../adapters/file-repository";
import { FileNotFound } from "../domain/errors";

export class DownloadPatientFile {
  private repository = new FileRepository();
  private access = new EnsurePatientAccess();

  async execute(data: { patientId: string; fileId: string }, user: BetterUser) {
    const patient = await this.access.execute(data.patientId, user);
    const file = isUuid(data.fileId)
      ? await this.repository.getById(data.fileId, patient.id, user.id)
      : undefined;

    if (!file) {
      throw new FileNotFound();
    }

    const stored = await getObject(file.storage_key);
    const bytes =
      file.is_encrypted && file.enc_key_version !== null
        ? decrypt(stored, user.id, file.enc_key_version)
        : stored;

    return { name: file.original_name, mimeType: file.mime_type, bytes };
  }
}
