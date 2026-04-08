import { SearchMedications } from "@/modules/prescription/application/search-medications";
import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseQuery } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";
import z from "zod";

const searchMedicationsSchema = z.object({
  patientId: z.uuid(),
  prescriptionId: z.uuid().optional(),
  query: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export const GET = async (request: NextRequest) => {
  await authenticate();
  const query = parseQuery(request, searchMedicationsSchema);
  const service = container.get(SearchMedications);

  return routeHandler(
    async () => {
      const result = await service.execute({
        patient_id: query.patientId,
        prescription_id: query.prescriptionId,
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

