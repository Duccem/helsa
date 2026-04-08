import { AddContactInfo } from "@/modules/patient/application/add-contact-info";
import { PatientNotFound } from "@/modules/patient/domain/patient-not-found";
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

const bodySchema = z
  .object({
    phone: z.string().min(1).optional(),
    address: z.string().min(1).optional(),
  })
  .refine((value) => Boolean(value.phone || value.address), {
    message: "At least one of phone or address is required",
  });

export const POST = async (request: NextRequest, ctx: RouteContext<"/api/patient/[id]/contact-info">) => {
  await authenticate();
  const { id } = await parseParams(ctx.params, paramsSchema);
  const body = await parseBody(request, bodySchema);
  const service = container.get(AddContactInfo);

  return routeHandler(
    async () => {
      await service.execute({
        patient_id: id,
        phone: body.phone,
        address: body.address,
      });

      return HttpNextResponse.noContent();
    },
    (error: PatientNotFound | InvalidArgument) => {
      switch (true) {
        case error instanceof PatientNotFound:
          return HttpNextResponse.domainError(error, 404);
        case error instanceof InvalidArgument:
          return HttpNextResponse.domainError(error, 400);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};

