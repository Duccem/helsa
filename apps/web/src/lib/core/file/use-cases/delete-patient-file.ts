import type { BetterUser } from "@helsa/auth";
import { isUuid } from "@/lib/utils/is-uuid";
import { EnsurePatientAccess } from "../../patient/use-cases/ensure-patient-access";
import { FileRepository } from "../adapters/file-repository";
import { FileNotFound } from "../domain/errors";

/**
 * Hides the file from the record. The encrypted object stays in storage, like
 * the rest of the clinical history, until a retention job removes it.
 */
export class DeletePatientFile {
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

    await this.repository.softDelete(file.id, user.id);
  }
}
