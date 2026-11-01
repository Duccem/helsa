import type { BetterUser } from "@helsa/auth";
import { isUuid } from "@/lib/utils/is-uuid";
import { assertTherapistRole } from "../../therapist/domain/guards";
import { PatientRepository } from "../adapters/patient-repository";
import { PatientNotFound } from "../domain/errors";

/** The patient, if it belongs to this therapist. Every patient use case starts here. */
export class EnsurePatientAccess {
  private repository = new PatientRepository();

  async execute(patient_id: string, user: BetterUser) {
    assertTherapistRole(user);

    if (!isUuid(patient_id)) {
      throw new PatientNotFound();
    }

    const patient = await this.repository.getById(patient_id, user.id);

    if (!patient) {
      throw new PatientNotFound();
    }

    return patient;
  }
}
