import { CreateDiagnosis } from "@/modules/diagnosis/application/create-diagnosis";
import { ListDiagnoses } from "@/modules/diagnosis/application/list-diagnoses";
import {
  DiagnosisCertaintyValues,
  DiagnosisIncomeValues,
  DiagnosisStateValues,
} from "@/modules/diagnosis/domain/diagnosis";
import { DrizzleDiagnosisRepository } from "@/modules/diagnosis/infrastructure/persistence/drizzle-diagnosis-repository";
import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseBody, parseQuery } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";
import z from "zod";

const createDiagnosisSchema = z.object({
  patientId: z.uuid(),
  summary: z.string().min(1),
  cieCode: z.string().min(1),
  certainty: z.enum(["PRESUMPTIVE", "DIFFERENTIAL", "DEFINITIVE", "DISCARD"]).optional(),
  state: z.enum(["ACTIVE", "REMISSION", "CURED", "RECURRENT", "DECEASED"]).optional(),
  income: z.enum(["INCOME", "PRINCIPAL", "SECONDARY", "EGRESS"]).optional(),
});

export const POST = async (request: NextRequest) => {
  await authenticate();
  const body = await parseBody(request, createDiagnosisSchema);
  const service = new CreateDiagnosis(new DrizzleDiagnosisRepository());

  return routeHandler(
    async () => {
      await service.execute({
        patient_id: body.patientId,
        summary: body.summary,
        cie_code: body.cieCode,
        certainty: body.certainty as DiagnosisCertaintyValues,
        state: body.state as DiagnosisStateValues,
        income: body.income as DiagnosisIncomeValues,
      });

      return HttpNextResponse.created();
    },
    (error: InvalidArgument) => {
      switch (true) {
        case error instanceof InvalidArgument:
          return HttpNextResponse.domainError(error, 400);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};

const listDiagnosesSchema = z.object({
  patientId: z.uuid().optional(),
  query: z.string().optional(),
  cieCode: z.string().optional(),
  certainty: z.enum(["PRESUMPTIVE", "DIFFERENTIAL", "DEFINITIVE", "DISCARD"]).optional(),
  state: z.enum(["ACTIVE", "REMISSION", "CURED", "RECURRENT", "DECEASED"]).optional(),
  income: z.enum(["INCOME", "PRINCIPAL", "SECONDARY", "EGRESS"]).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export const GET = async (request: NextRequest) => {
  await authenticate();
  const query = parseQuery(request, listDiagnosesSchema);
  const service = new ListDiagnoses(new DrizzleDiagnosisRepository());

  return routeHandler(
    async () => {
      const result = await service.execute({
        patient_id: query.patientId,
        query: query.query,
        cie_code: query.cieCode,
        certainty: query.certainty as DiagnosisCertaintyValues,
        state: query.state as DiagnosisStateValues,
        income: query.income as DiagnosisIncomeValues,
        page: query.page,
        pageSize: query.pageSize,
      });

      return HttpNextResponse.json(result);
    },
    (error: InvalidArgument) => {
      switch (true) {
        case error instanceof InvalidArgument:
          return HttpNextResponse.domainError(error, 400);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};

