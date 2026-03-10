import { GetDoctorDetails } from "@/modules/doctor/application/get-doctor-details";
import { RegisterDoctor } from "@/modules/doctor/application/register-doctor";
import { SearchDoctors } from "@/modules/doctor/application/search-doctors";
import { DoctorAlreadyExists } from "@/modules/doctor/domain/doctor-already-exists";
import { DoctorLicenseNotValid } from "@/modules/doctor/domain/doctor-license-not-valid";
import { DoctorNotFound } from "@/modules/doctor/domain/doctor-not-found";
import { SpecialtyNotFound } from "@/modules/doctor/domain/specialty-not-found";
import {
  DrizzleDoctorRepository,
  DrizzleSpecialtyRepository,
} from "@/modules/doctor/infrastructure/persistence/drizzle-doctor-repository";
import { VenezuelanDoctorLicenseValidationService } from "@/modules/doctor/infrastructure/venezuelan-licencense-validation";
import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseBody, parseQuery } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";
import z from "zod";

const registerDoctorSchema = z.object({
  specialtyId: z.uuid(),
  licenseNumber: z.string().min(1),
  experience: z.coerce.number().min(0),
  bio: z.string().optional(),
  prices: z.array(z.coerce.number().positive()).optional(),
  officeAddresses: z
    .array(
      z.object({
        address: z.string().min(1),
        location: z.object({
          latitude: z.coerce.number(),
          longitude: z.coerce.number(),
        }),
      }),
    )
    .optional(),
});

export const POST = async (request: NextRequest) => {
  const { session } = await authenticate();
  const body = await parseBody(request, registerDoctorSchema);
  const service = new RegisterDoctor(
    new DrizzleDoctorRepository(),
    new DrizzleSpecialtyRepository(),
    new VenezuelanDoctorLicenseValidationService(),
  );

  return routeHandler(
    async () => {
      await service.execute({
        user_id: session.user.id,
        specialty_id: body.specialtyId,
        license_number: body.licenseNumber,
        experience: body.experience,
        bio: body.bio,
        prices: body.prices,
        office_addresses: body.officeAddresses,
      });

      return HttpNextResponse.created();
    },
    (error: DoctorAlreadyExists | SpecialtyNotFound | DoctorLicenseNotValid | InvalidArgument) => {
      switch (true) {
        case error instanceof DoctorAlreadyExists:
          return HttpNextResponse.domainError(error, 409);
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

const searchDoctorsSchema = z.object({
  specialtyId: z.uuid().optional(),
  minScore: z.coerce.number().optional(),
  minExperience: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export const GET = async (request: NextRequest) => {
  await authenticate();
  const query = parseQuery(request, searchDoctorsSchema);
  const service = new SearchDoctors(new DrizzleDoctorRepository());

  return routeHandler(
    async () => {
      const result = await service.execute({
        specialty_id: query.specialtyId,
        min_score: query.minScore,
        min_experience: query.minExperience,
        max_price: query.maxPrice,
        page: query.page,
        pageSize: query.pageSize,
      });

      return HttpNextResponse.json(result);
    },
    (error: InvalidArgument) => {
      switch (true) {
        case error instanceof InvalidArgument:
          return HttpNextResponse.domainError(error, 400);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};

