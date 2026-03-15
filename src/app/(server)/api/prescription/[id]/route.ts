import { GetPrescriptionDetails } from "@/modules/prescription/application/get-prescription-details";
import { UpdatePrescription } from "@/modules/prescription/application/update-prescription";
import { PrescriptionNotFound } from "@/modules/prescription/domain/prescription-not-found";
import { DrizzlePrescriptionRepository } from "@/modules/prescription/infrastructure/persistence/drizzle-prescription-repository";
import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseBody, parseParams } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";
import z from "zod";

const paramsSchema = z.object({
  id: z.uuid(),
});

export const GET = async (_: NextRequest, ctx: RouteContext<"/api/prescription/[id]">) => {
  await authenticate();
  const { id } = await parseParams(ctx.params, paramsSchema);
  const service = new GetPrescriptionDetails(new DrizzlePrescriptionRepository());

  return routeHandler(
    async () => {
      const data = await service.execute(id);

      return HttpNextResponse.json(data);
    },
    (error: PrescriptionNotFound | NotAuthorized) => {
      switch (true) {
        case error instanceof PrescriptionNotFound:
          return HttpNextResponse.domainError(error, 404);
        case error instanceof NotAuthorized:
          return HttpNextResponse.domainError(error, 403);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};

const updatePrescriptionSchema = z.object({
  observation: z.string().min(1),
});

export const PUT = async (request: NextRequest, ctx: RouteContext<"/api/prescription/[id]">) => {
  await authenticate();
  const { id } = await parseParams(ctx.params, paramsSchema);
  const body = await parseBody(request, updatePrescriptionSchema);
  const service = new UpdatePrescription(new DrizzlePrescriptionRepository());

  return routeHandler(
    async () => {
      await service.execute(id, body.observation);

      return HttpNextResponse.noContent();
    },
    (error: PrescriptionNotFound | InvalidArgument) => {
      switch (true) {
        case error instanceof PrescriptionNotFound:
          return HttpNextResponse.domainError(error, 404);
        case error instanceof InvalidArgument:
          return HttpNextResponse.domainError(error, 400);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};

