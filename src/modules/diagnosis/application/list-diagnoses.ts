import { PaginatedResult } from "@/modules/shared/domain/query";
import { Diagnosis } from "../domain/diagnosis";
import { DiagnosisRepository, DiagnosisSearchCriteria } from "../domain/diagnosis-repository";
import { Primitives } from "@/modules/shared/domain/primitives";
import { diagnosis } from "../infrastructure/persistence/diagnosis.schema";
import { ApplicationService } from "@/modules/shared/domain/service.";

export type ListDiagnosesInputDto = DiagnosisSearchCriteria;
export type ListDiagnosesOutputDto = PaginatedResult<Primitives<Diagnosis>>;

@ApplicationService()
export class ListDiagnoses {
  constructor(private readonly repository: DiagnosisRepository) {}

  async execute(criteria: ListDiagnosesInputDto): Promise<ListDiagnosesOutputDto> {
    const { data, pagination } = await this.repository.search(criteria);

    return {
      data: data.map((diagnosis) => diagnosis.toPrimitives()),
      pagination,
    };
  }
}

