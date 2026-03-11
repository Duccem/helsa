import { Pathology } from "../domain/pathology";
import { DiagnosisRepository } from "../domain/diagnosis-repository";

export type ListPathologiesInputDto = {
  query?: string;
};

export type ListPathologiesOutputDto = Pathology[];

export class ListPathologies {
  constructor(private readonly repository: DiagnosisRepository) {}

  async execute(params: ListPathologiesInputDto = {}): Promise<ListPathologiesOutputDto> {
    return await this.repository.listPathologies(params.query);
  }
}

