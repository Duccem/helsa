import { SetPhysicalInformation } from "@/modules/patient/application/set-physical-information";
import { PatientNotFound } from "@/modules/patient/domain/patient-not-found";
import { DrizzlePatientRepository } from "@/modules/patient/infrastructure/persistence/drizzle-patient-repository";
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
  height: z.number().optional(),
  weight: z.number().optional(),
  bloodType: z.string().min(1).optional(),
  bodyMassIndex: z.number().optional(),
});

export const PUT = async (request: NextRequest, ctx: RouteContext<"/api/patient/[id]/physical-information">) => {
  await authenticate();
  const { id } = await parseParams(ctx.params, paramsSchema);
  const body = await parseBody(request, bodySchema);
  const service = new SetPhysicalInformation(new DrizzlePatientRepository());

  return routeHandler(
    async () => {
      await service.execute({
        patient_id: id,
        height: body.height,
        weight: body.weight,
        blood_type: body.bloodType,
        body_mass_index: body.bodyMassIndex,
      });

      return HttpNextResponse.noContent();
    },
    (error: PatientNotFound) => {
      switch (true) {
        case error instanceof PatientNotFound:
          return HttpNextResponse.domainError(error, 404);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};
