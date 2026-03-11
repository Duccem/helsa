import { PaginatedResult } from "@/modules/shared/domain/query";
import { Diagnosis } from "../domain/diagnosis";
import { DiagnosisRepository, DiagnosisSearchCriteria } from "../domain/diagnosis-repository";

export type ListDiagnosesInputDto = DiagnosisSearchCriteria;
export type ListDiagnosesOutputDto = PaginatedResult<Diagnosis>;

export class ListDiagnoses {
  constructor(private readonly repository: DiagnosisRepository) {}

  async execute(criteria: ListDiagnosesInputDto): Promise<ListDiagnosesOutputDto> {
    return await this.repository.search(criteria);
  }
}

