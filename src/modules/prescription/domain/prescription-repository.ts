import { PaginatedQuery, PaginatedResult } from "@/modules/shared/domain/query";
import { Prescription, PrescriptionId } from "./prescription";
import { Medication, MedicationId } from "./medication";
import { MedicationReminder } from "./medication-reminder";

export type PrescriptionSearchCriteria = PaginatedQuery & {
  organization_id: string;
  patient_id?: string;
  doctor_id?: string;
  query?: string;
};

export type MedicationSearchCriteria = PaginatedQuery & {
  patient_id: string;
  prescription_id?: string;
  query?: string;
};

export type ReminderSearchCriteria = PaginatedQuery & {
  is_taken?: boolean;
  forgotten?: boolean;
  start_date?: Date;
  end_date?: Date;
};

export interface PrescriptionRepository {
  save(prescription: Prescription): Promise<void>;
  find(id: PrescriptionId): Promise<Prescription | null>;
  search(criteria: PrescriptionSearchCriteria): Promise<PaginatedResult<Prescription>>;
  searchMedications(criteria: MedicationSearchCriteria): Promise<PaginatedResult<Medication>>;
  findMedication(id: MedicationId): Promise<Medication | null>;
  listRemindersForPrescription(prescription_id: PrescriptionId): Promise<MedicationReminder[]>;
  searchReminders(query: ReminderSearchCriteria): Promise<PaginatedResult<MedicationReminder>>;
}

