import { GetPatientDetails } from "@/modules/patient/application/get-patient-details";
import { UpdatePatient } from "@/modules/patient/application/update-patient";
import { PatientGenderValues } from "@/modules/patient/domain/patient";
import { PatientAlreadyExists } from "@/modules/patient/domain/patient-already-exists";
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

export const GET = async (_: NextRequest, ctx: RouteContext<"/api/patient/[id]">) => {
  await authenticate();
  const { id } = await parseParams(ctx.params, paramsSchema);
  const service = container.get(GetPatientDetails);

  return routeHandler(
    async () => {
      const data = await service.execute(id);
      return HttpNextResponse.json(data);
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

const updatePatientSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1),
  birthDate: z.coerce.date(),
  gender: z.enum(["MAN", "WOMAN", "OTHER"]).optional(),
});

export const PUT = async (request: NextRequest, ctx: RouteContext<"/api/patient/[id]">) => {
  await authenticate();
  const { id } = await parseParams(ctx.params, paramsSchema);
  const body = await parseBody(request, updatePatientSchema);
  const service = container.get(UpdatePatient);

  return routeHandler(
    async () => {
      await service.execute({
        patient_id: id,
        email: body.email,
        name: body.name,
        birth_date: body.birthDate,
        gender: body.gender as PatientGenderValues,
      });

      return HttpNextResponse.noContent();
    },
    (error: PatientNotFound | PatientAlreadyExists | InvalidArgument) => {
      switch (true) {
        case error instanceof PatientNotFound:
          return HttpNextResponse.domainError(error, 404);
        case error instanceof PatientAlreadyExists:
          return HttpNextResponse.domainError(error, 409);
        case error instanceof InvalidArgument:
          return HttpNextResponse.domainError(error, 400);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};

