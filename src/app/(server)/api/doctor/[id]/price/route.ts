import { AddDoctorPrice } from "@/modules/doctor/application/add-doctor-price";
import { DoctorNotFound } from "@/modules/doctor/domain/doctor-not-found";
import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseBody, parseParams } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";
import z from "zod";

const paramsSchema = z.object({
  id: z.uuid(),
});

const bodySchema = z.object({
  amount: z.coerce.number().positive(),
  mode: z.enum(["CREDIT", "POSTPAID", "PREPAID"]),
});

export const POST = async (request: NextRequest, ctx: RouteContext<"/api/doctor/[id]/price">) => {
  await authenticate();
  const { id } = await parseParams(ctx.params, paramsSchema);
  const body = await parseBody(request, bodySchema);
  const service = container.get(AddDoctorPrice);

  return routeHandler(
    async () => {
      await service.execute(id, body.amount, body.mode);
      return HttpNextResponse.noContent();
    },
    (error: DoctorNotFound | InvalidArgument) => {
      switch (true) {
        case error instanceof DoctorNotFound:
          return HttpNextResponse.domainError(error, 404);
        case error instanceof InvalidArgument:
          return HttpNextResponse.domainError(error, 400);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};

