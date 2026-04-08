import { GetDoctorDetails } from "@/modules/doctor/application/get-doctor-details";
import { UpdateDoctorProfile } from "@/modules/doctor/application/update-doctor-profile";
import { DoctorLicenseNotValid } from "@/modules/doctor/domain/doctor-license-not-valid";
import { DoctorNotFound } from "@/modules/doctor/domain/doctor-not-found";
import { SpecialtyNotFound } from "@/modules/doctor/domain/specialty-not-found";
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

export const GET = async (_: NextRequest, ctx: RouteContext<"/api/doctor/[id]">) => {
  await authenticate();
  const { id } = await parseParams(ctx.params, paramsSchema);
  const service = container.get(GetDoctorDetails);

  return routeHandler(
    async () => {
      const data = await service.execute(id);
      return HttpNextResponse.json(data);
    },
    (error: DoctorNotFound) => {
      switch (true) {
        case error instanceof DoctorNotFound:
          return HttpNextResponse.domainError(error, 404);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};

const bodySchema = z.object({
  specialtyId: z.uuid(),
  licenseNumber: z.string().min(1),
  experience: z.coerce.number().min(0),
  bio: z.string().optional(),
});

export const PUT = async (request: NextRequest, ctx: RouteContext<"/api/doctor/[id]">) => {
  await authenticate();
  const { id } = await parseParams(ctx.params, paramsSchema);
  const body = await parseBody(request, bodySchema);
  const service = container.get(UpdateDoctorProfile);

  return routeHandler(
    async () => {
      await service.execute({
        doctor_id: id,
        specialty_id: body.specialtyId,
        license_number: body.licenseNumber,
        experience: body.experience,
        bio: body.bio,
      });

      return HttpNextResponse.noContent();
    },
    (error: DoctorNotFound | SpecialtyNotFound | DoctorLicenseNotValid | InvalidArgument) => {
      switch (true) {
        case error instanceof DoctorNotFound:
          return HttpNextResponse.domainError(error, 404);
        case error instanceof SpecialtyNotFound:
          return HttpNextResponse.domainError(error, 404);
        case error instanceof DoctorLicenseNotValid:
          return HttpNextResponse.domainError(error, 400);
        case error instanceof InvalidArgument:
          return HttpNextResponse.domainError(error, 400);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};

