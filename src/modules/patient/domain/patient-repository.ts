import { PaginatedQuery, PaginatedResult } from "@/modules/shared/domain/query";
import { Patient, PatientGenderValues, PatientId } from "./patient";

export type PatientSearchCriteria = PaginatedQuery & {
  organization_id: string;
  query?: string;
  email?: string;
  gender?: PatientGenderValues;
};

export interface PatientRepository {
  save(patient: Patient): Promise<void>;
  find(id: PatientId): Promise<Patient | null>;
  findByEmail(organization_id: string, email: string): Promise<Patient | null>;
  search(criteria: PatientSearchCriteria): Promise<PaginatedResult<Patient>>;
}

