import { MedicalRecord, MedicalRecordId, MedicalRecordTypeValues } from "./medical-record";

export type MedicalRecordSearchCriteria = {
  patient_id?: string;
  doctor_id?: string;
  query?: string;
  date_from?: Date;
  date_to?: Date;
  type: MedicalRecordTypeValues;
};

export abstract class MedicalRecordRepository {
  abstract get(id: MedicalRecordId): Promise<MedicalRecord | null>;
  abstract search(criteria: MedicalRecordSearchCriteria): Promise<MedicalRecord[]>;
  abstract create(record: MedicalRecord): Promise<void>;
  abstract update(record: MedicalRecord): Promise<void>;
  abstract delete(id: MedicalRecordId): Promise<void>;
  abstract count(criteria: MedicalRecordSearchCriteria): Promise<number>;
}

