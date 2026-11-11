import type { BetterUser } from "@helsa/auth";
import { NotPermissions } from "@/lib/utils/error";
import { PatientRepository } from "../adapters/patient-repository";
import { PatientNotFound } from "../domain/errors";

/**
 * The record a patient account works on in the portal. Everything the patient
 * reads or changes is scoped to it, and through it to their therapist.
 */
export class EnsurePortalPatient {
  private repository = new PatientRepository();

  async execute(user: Pick<BetterUser, "id" | "role">) {
    if (user.role !== "patient") {
      throw new NotPermissions();
    }

    const patient = await this.repository.findByAccount(user.id);
    if (!patient) {
      throw new PatientNotFound();
    }

    return patient;
  }

  /** Same, but null instead of throwing when the account has no record yet. */
  async find(user: Pick<BetterUser, "id" | "role">) {
    if (user.role !== "patient") return null;
    return (await this.repository.findByAccount(user.id)) ?? null;
  }
}
