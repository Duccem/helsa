import { AddDaysToSchedule } from "@/modules/schedule/application/add-days-to-schedule";
import { ScheduleNotFound } from "@/modules/schedule/domain/schedule-not-found";
import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseBody, parseParams } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";
import z from "zod";

const paramsSchema = z.object({
  doctorId: z.uuid(),
});

const bodySchema = z.object({
  deletePrevious: z.boolean().default(true),
  days: z
    .array(
      z.object({
        day: z.coerce.number().int().min(0).max(6),
        startHour: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
        endHour: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
      }),
    )
    .min(1),
});

export const POST = async (request: NextRequest, ctx: RouteContext<"/api/schedule/[doctorId]/day">) => {
  await authenticate();
  const { doctorId } = await parseParams(ctx.params, paramsSchema);
  const body = await parseBody(request, bodySchema);
  const service = container.get(AddDaysToSchedule);

  return routeHandler(
    async () => {
      await service.execute(
        doctorId,
        body.days.map((item) => ({
          day: item.day,
          start_hour: item.startHour,
          end_hour: item.endHour,
        })),
        body.deletePrevious,
      );

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

