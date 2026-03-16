import type { NextRequest } from "next/server";
import z from "zod";
import { GetAppointmentDetails } from "@/modules/appointment/application/get-appointment-details";
import { UpdateAppointmentStatus } from "@/modules/appointment/application/update-status";
import { AppointmentNotFound } from "@/modules/appointment/domain/appointment-not-found";
import { DrizzleAppointmentRepository } from "@/modules/appointment/infrastructure/persistence/drizzle-appointment-repository";
import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseBody, parseParams } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";

const paramsSchema = z.object({
  id: z.uuid(),
});

export const GET = async (_: NextRequest, ctx: RouteContext<"/api/appointment/[id]">) => {
  await authenticate();
  const service = new GetAppointmentDetails(new DrizzleAppointmentRepository());
  const { id } = await parseParams(ctx.params, paramsSchema);

  return routeHandler(
    async () => {
      const data = await service.execute(id);

      return HttpNextResponse.json(data.toPrimitives());
    },
    (error: AppointmentNotFound | NotAuthorized) => {
      switch (true) {
        case error instanceof AppointmentNotFound:
          return HttpNextResponse.domainError(error, 404);
        case error instanceof NotAuthorized:
          return HttpNextResponse.domainError(error, 403);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};

const bodySchema = z.object({
  status: z.enum([
    "SCHEDULED",
    "CONFIRMED",
    "PAYED",
    "READY",
    "STARTED",
    "CANCELLED",
    "MISSED_BY_PATIENT",
    "MISSED_BY_THERAPIST",
    "FINISHED",
  ]),
});

export const PUT = async (request: NextRequest, ctx: RouteContext<"/api/appointment/[id]">) => {
  await authenticate();
  const service = new UpdateAppointmentStatus(new DrizzleAppointmentRepository());
  const { id } = await parseParams(ctx.params, paramsSchema);
  const { status } = await parseBody(request, bodySchema);

  return routeHandler(
    async () => {
      await service.execute(id, status);

      return HttpNextResponse.noContent();
    },
    (error: AppointmentNotFound | NotAuthorized) => {
      switch (true) {
        case error instanceof AppointmentNotFound:
          return HttpNextResponse.domainError(error, 404);
        case error instanceof NotAuthorized:
          return HttpNextResponse.domainError(error, 403);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};

