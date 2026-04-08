import { ApplicationService } from "@/modules/shared/domain/service.";
import { Diagnosis, DiagnosisCertaintyValues, DiagnosisIncomeValues, DiagnosisStateValues } from "../domain/diagnosis";
import { DiagnosisRepository } from "../domain/diagnosis-repository";

export type CreateDiagnosisInputDto = {
  patient_id: string;
  summary: string;
  cie_code: string;
  certainty?: DiagnosisCertaintyValues;
  state?: DiagnosisStateValues;
  income?: DiagnosisIncomeValues;
};

@ApplicationService()
export class CreateDiagnosis {
  constructor(private readonly repository: DiagnosisRepository) {}

  async execute(params: CreateDiagnosisInputDto): Promise<void> {
    const diagnosis = Diagnosis.create(params);
    await this.repository.save(diagnosis);
  }
}

