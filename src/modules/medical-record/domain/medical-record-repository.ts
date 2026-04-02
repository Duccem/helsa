import { PaginatedResult } from "@/modules/shared/domain/query";
import { MedicalRecord, MedicalRecordId, MedicalRecordTypeValues } from "./medical-record";

export type MedicalRecordSearchCriteria = {
  patient_id?: string;
  doctor_id?: string;
  query?: string;
  date_from?: Date;
  date_to?: Date;
  type: MedicalRecordTypeValues;
  page?: number;
  pageSize?: number;
};

export abstract class MedicalRecordRepository {
  abstract get(id: MedicalRecordId): Promise<MedicalRecord | null>;
  abstract search(criteria: MedicalRecordSearchCriteria): Promise<PaginatedResult<MedicalRecord>>;
  abstract create(record: MedicalRecord): Promise<void>;
  abstract update(record: MedicalRecord): Promise<void>;
  abstract delete(id: MedicalRecordId): Promise<void>;
}

