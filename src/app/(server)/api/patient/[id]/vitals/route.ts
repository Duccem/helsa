import { AddVitals } from "@/modules/patient/application/add-vitals";
import { PatientNotFound } from "@/modules/patient/domain/patient-not-found";
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
  bloodPressure: z.number().optional(),
  heartRate: z.number().optional(),
  respiratoryRate: z.number().optional(),
  oxygenSaturation: z.number().optional(),
  temperature: z.number().optional(),
});

export const POST = async (request: NextRequest, ctx: RouteContext<"/api/patient/[id]/vitals">) => {
  await authenticate();
  const { id } = await parseParams(ctx.params, paramsSchema);
  const body = await parseBody(request, bodySchema);
  const service = container.get(AddVitals);

  return routeHandler(
    async () => {
      await service.execute({
        patient_id: id,
        blood_pressure: body.bloodPressure,
        heart_rate: body.heartRate,
        respiratory_rate: body.respiratoryRate,
        oxygen_saturation: body.oxygenSaturation,
        temperature: body.temperature,
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
