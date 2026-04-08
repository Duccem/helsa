import { GetSchedule } from "@/modules/schedule/application/get-schedule";
import { ScheduleNotFound } from "@/modules/schedule/domain/schedule-not-found";
import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseParams } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";
import z from "zod";

const getScheduleParamSchema = z.object({
  doctorId: z.uuid(),
});

export const GET = async (_request: NextRequest, ctx: RouteContext<"/api/schedule/[doctorId]">) => {
  await authenticate();
  const query = await parseParams(ctx.params, getScheduleParamSchema);
  const service = container.get(GetSchedule);

  return routeHandler(
    async () => {
      const result = await service.execute(query.doctorId);

      return HttpNextResponse.json(result);
    },
    (error: ScheduleNotFound | InvalidArgument) => {
      switch (true) {
        case error instanceof ScheduleNotFound:
          return HttpNextResponse.domainError(error, 404);
        case error instanceof InvalidArgument:
          return HttpNextResponse.domainError(error, 400);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};

