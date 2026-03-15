import { AddAppointmentNote, AddAppointmentNoteErrors } from "@/modules/appointment/application/add-note";
import { AppointmentNotFound } from "@/modules/appointment/domain/appointment-not-found";
import { DrizzleAppointmentRepository } from "@/modules/appointment/infrastructure/persistence/drizzle-appointment-repository";
import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseBody, parseParams } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";
import z from "zod";

const bodySchema = z.object({
  note: z.string().min(1),
});

const paramsSchema = z.object({
  id: z.uuid(),
});

export const POST = async (request: NextRequest, ctx: RouteContext<"/api/appointment/[id]/note">) => {
  await authenticate();
  const service = new AddAppointmentNote(new DrizzleAppointmentRepository());
  const { id } = await parseParams(ctx.params, paramsSchema);
  const { note } = await parseBody(request, bodySchema);

  return routeHandler(
    async () => {
      await service.execute({ appointment_id: id, note });

      return HttpNextResponse.noContent();
    },
    (error: AddAppointmentNoteErrors) => {
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

