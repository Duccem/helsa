import { DoctorNotFound } from "@/modules/doctor/domain/doctor-not-found";
import { GetDoctorHomeMetrics } from "@/modules/home/application/get-doctor-home-metrics";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseQuery } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";
import z from "zod";

const querySchema = z.object({
  date: z.coerce.date().optional(),
});

export const GET = async (request: NextRequest) => {
  const { session } = await authenticate();
  const query = parseQuery(request, querySchema);

  return routeHandler(
    async () => {
      const service = container.get(GetDoctorHomeMetrics);
      const metrics = await service.execute(session.user.id, query.date);

      return HttpNextResponse.json({ metrics });
    },
    (error: DoctorNotFound) => {
      switch (true) {
        case error instanceof DoctorNotFound:
          return HttpNextResponse.domainError(error, 404);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};
