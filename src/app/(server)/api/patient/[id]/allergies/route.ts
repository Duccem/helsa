import { AddAllergy } from "@/modules/patient/application/add-allergy";
import { RemoveAllergy } from "@/modules/patient/application/remove-allergy";
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
  name: z.string().min(1),
  severity: z.enum(["LOW", "MODERATE", "HIGH", "CRITICAL"]).optional(),
  notes: z.string().optional(),
});

export const POST = async (request: NextRequest, ctx: RouteContext<"/api/patient/[id]/allergies">) => {
  await authenticate();
  const { id } = await parseParams(ctx.params, paramsSchema);
  const body = await parseBody(request, bodySchema);
  const service = new AddAllergy(new DrizzlePatientRepository());

  return routeHandler(
    async () => {
      await service.execute({
        patient_id: id,
        name: body.name,
        severity: body.severity,
        notes: body.notes,
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

const deleteBodySchema = z.object({
  allergyId: z.uuid(),
});

export const DELETE = async (request: NextRequest, ctx: RouteContext<"/api/patient/[id]/allergies">) => {
  await authenticate();
  const { id } = await parseParams(ctx.params, paramsSchema);
  const body = await parseBody(request, deleteBodySchema);
  const service = new RemoveAllergy(new DrizzlePatientRepository());

  return routeHandler(
    async () => {
      await service.execute({
        patient_id: id,
        allergy_id: body.allergyId,
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
