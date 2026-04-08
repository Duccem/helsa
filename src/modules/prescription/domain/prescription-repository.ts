import { PaginatedQuery, PaginatedResult } from "@/modules/shared/domain/query";
import { Prescription, PrescriptionId } from "./prescription";
import { Medication, MedicationId } from "./medication";
import { MedicationReminder } from "./medication-reminder";

export type PrescriptionSearchCriteria = PaginatedQuery & {
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

export abstract class PrescriptionRepository {
  abstract save(prescription: Prescription): Promise<void>;
  abstract find(id: PrescriptionId): Promise<Prescription | null>;
  abstract search(criteria: PrescriptionSearchCriteria): Promise<PaginatedResult<Prescription>>;
  abstract searchMedications(criteria: MedicationSearchCriteria): Promise<PaginatedResult<Medication>>;
  abstract findMedication(id: MedicationId): Promise<Medication | null>;
  abstract listRemindersForPrescription(prescription_id: PrescriptionId): Promise<MedicationReminder[]>;
  abstract searchReminders(query: ReminderSearchCriteria): Promise<PaginatedResult<MedicationReminder>>;
}

