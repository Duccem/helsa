import type { BetterUser } from "@helsa/auth";
import type { PatientInput } from "@/components/dashboard/patients/schema";
import { PatientRepository } from "../adapters/patient-repository";
import { toPatientColumns } from "../domain/mappers";
import type { Patient } from "../domain/types";
import { EnsurePatientAccess } from "./ensure-patient-access";

type UpdatePatientInput = PatientInput & { patientId: string };

export class UpdatePatient {
  private repository = new PatientRepository();
  private access = new EnsurePatientAccess();

  async execute(data: UpdatePatientInput, user: BetterUser) {
    const patient = await this.access.execute(data.patientId, user);

    await this.repository.update(this.updatePatientData(data, patient, user.id));
  }

  private updatePatientData(data: PatientInput, patient: Patient, therapist_id: string) {
    const discharged = data.status === "discharged";
    return {
      ...patient,
      ...toPatientColumns(data, therapist_id),
      discharged_at: discharged ? (patient.discharged_at ?? new Date()) : null,
    };
  }
}
