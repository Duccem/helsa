import { PaginatedQuery, PaginatedResult } from "@/modules/shared/domain/query";
import { Patient, PatientGenderValues, PatientId, PatientUserId } from "./patient";

export type PatientSearchCriteria = PaginatedQuery & {
  query?: string;
  email?: string;
  gender?: PatientGenderValues;
};

export interface PatientRepository {
  save(patient: Patient): Promise<void>;
  find(id: PatientId): Promise<Patient | null>;
  findByEmail(email: string): Promise<Patient | null>;
  findByUserId(userId: PatientUserId): Promise<Patient | null>;
  search(criteria: PatientSearchCriteria): Promise<PaginatedResult<Patient>>;
}

