import { CreatePatient } from "@/modules/patient/application/create-patient";
import { SearchPatients } from "@/modules/patient/application/search-patients";
import { PatientGenderValues } from "@/modules/patient/domain/patient";
import { PatientAlreadyExists } from "@/modules/patient/domain/patient-already-exists";
import { DrizzlePatientRepository } from "@/modules/patient/infrastructure/persistence/drizzle-patient-repository";
import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseBody, parseQuery } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";
import z from "zod";

const createPatientSchema = z.object({
  email: z.email(),
  name: z.string().min(1),
  birthDate: z.coerce.date(),
  gender: z.enum(["MAN", "WOMAN", "OTHER"]),
  contactInfo: z
    .array(
      z
        .object({
          phone: z.string().min(1).optional(),
          address: z.string().min(1).optional(),
        })
        .refine((value) => Boolean(value.phone || value.address), {
          message: "At least one of phone or address is required",
        }),
    )
    .optional(),
});

export const POST = async (request: NextRequest) => {
  const { organization, session } = await authenticate();
  const body = await parseBody(request, createPatientSchema);
  const service = new CreatePatient(new DrizzlePatientRepository());

  return routeHandler(
    async () => {
      await service.execute({
        user_id: session.user.id,
        email: body.email,
        name: body.name,
        birth_date: body.birthDate,
        gender: body.gender as PatientGenderValues,
        contact_info: body.contactInfo,
      });

      return HttpNextResponse.created();
    },
    (error: PatientAlreadyExists | InvalidArgument) => {
      switch (true) {
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

const searchPatientsSchema = z.object({
  query: z.string().optional(),
  email: z.string().optional(),
  gender: z.enum(["MAN", "WOMAN", "OTHER"]).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export const GET = async (request: NextRequest) => {
  await authenticate();
  const query = parseQuery(request, searchPatientsSchema);
  const service = new SearchPatients(new DrizzlePatientRepository());

  return routeHandler(
    async () => {
      const result = await service.execute({
        query: query.query,
        email: query.email,
        gender: query.gender as PatientGenderValues,
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

