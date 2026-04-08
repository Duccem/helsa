import { AddPrescription } from "@/modules/prescription/application/add-prescription";
import { SearchPrescriptions } from "@/modules/prescription/application/search-prescriptions";
import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseBody, parseQuery } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";
import z from "zod";

const createPrescriptionSchema = z.object({
  patientId: z.uuid(),
  doctorId: z.uuid(),
  observation: z.string().min(1),
});

export const POST = async (request: NextRequest) => {
  await authenticate();
  const body = await parseBody(request, createPrescriptionSchema);
  const service = container.get(AddPrescription);

  return routeHandler(
    async () => {
      await service.execute(body.patientId, body.doctorId, body.observation);

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

const searchPrescriptionsSchema = z.object({
  patientId: z.uuid().optional(),
  doctorId: z.uuid().optional(),
  query: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export const GET = async (request: NextRequest) => {
  await authenticate();
  const query = parseQuery(request, searchPrescriptionsSchema);
  const service = container.get(SearchPrescriptions);

  return routeHandler(
    async () => {
      const result = await service.execute({
        patient_id: query.patientId,
        doctor_id: query.doctorId,
        query: query.query,
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

