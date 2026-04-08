import { PaginatedQuery, PaginatedResult } from "@/modules/shared/domain/query";
import { Patient, PatientGenderValues, PatientId, PatientUserId } from "./patient";

export type PatientSearchCriteria = PaginatedQuery & {
  query?: string;
  email?: string;
  gender?: PatientGenderValues;
};

export abstract class PatientRepository {
  abstract save(patient: Patient): Promise<void>;
  abstract find(id: PatientId): Promise<Patient | null>;
  abstract findByEmail(email: string): Promise<Patient | null>;
  abstract findByUserId(userId: PatientUserId): Promise<Patient | null>;
  abstract search(criteria: PatientSearchCriteria): Promise<PaginatedResult<Patient>>;
}

