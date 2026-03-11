import { PaginatedQuery, PaginatedResult } from "@/modules/shared/domain/query";
import {
  Diagnosis,
  DiagnosisCertaintyValues,
  DiagnosisId,
  DiagnosisIncomeValues,
  DiagnosisStateValues,
} from "./diagnosis";
import { Pathology } from "./pathology";

export type DiagnosisSearchCriteria = PaginatedQuery & {
  patient_id?: string;
  query?: string;
  cie_code?: string;
  certainty?: DiagnosisCertaintyValues;
  state?: DiagnosisStateValues;
  income?: DiagnosisIncomeValues;
};

export interface DiagnosisRepository {
  save(diagnosis: Diagnosis): Promise<void>;
  find(id: DiagnosisId): Promise<Diagnosis | null>;
  search(criteria: DiagnosisSearchCriteria): Promise<PaginatedResult<Diagnosis>>;
  listPathologies(query?: string): Promise<Pathology[]>;
}

