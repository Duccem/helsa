import { GenerateAvailability } from "@/modules/schedule/application/generate-availability";
import { GetAvailabilities } from "@/modules/schedule/application/get-availabilities";
import { AvailabilitySlotStateValues } from "@/modules/schedule/domain/availability-slot";
import { ScheduleNotFound } from "@/modules/schedule/domain/schedule-not-found";
import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseParams, parseQuery } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";
import z from "zod";

const paramsSchema = z.object({
  doctorId: z.uuid(),
});

export const POST = async (_: NextRequest, ctx: RouteContext<"/api/schedule/[doctorId]/availability">) => {
  await authenticate();
  const { doctorId } = await parseParams(ctx.params, paramsSchema);
  const service = container.get(GenerateAvailability);

  return routeHandler(
    async () => {
      await service.execute(doctorId);
      return HttpNextResponse.noContent();
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

const getAvailabilitiesQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  state: z.enum(["AVAILABLE", "TAKEN"]).optional(),
});

export const GET = async (request: NextRequest, ctx: RouteContext<"/api/schedule/[doctorId]/availability">) => {
  await authenticate();
  const { doctorId } = await parseParams(ctx.params, paramsSchema);
  const query = parseQuery(request, getAvailabilitiesQuerySchema);
  const service = container.get(GetAvailabilities);

  return routeHandler(
    async () => {
      const slots = await service.execute(doctorId, query.startDate, query.endDate, query.state);

      return HttpNextResponse.json({
        slots,
      });
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

