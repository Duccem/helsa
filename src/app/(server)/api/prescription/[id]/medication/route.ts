import { AddMedicationToPrescription } from "@/modules/prescription/application/add-medication-to-prescription";
import { MedicationStateValues } from "@/modules/prescription/domain/medication";
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

const alternativeDrugSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  dosage: z.string().min(1),
  dosageUnit: z.string().min(1),
  administrationMethod: z.string().min(1),
});

const bodySchema = z.object({
  name: z.string().min(1),
  dosage: z.coerce.number().positive(),
  dosageUnit: z.string().min(1),
  frequency: z.string().min(1),
  administrationMethod: z.string().min(1),
  alternatives: z.array(alternativeDrugSchema).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  state: z.enum(["PENDING", "ACTIVE", "PAUSED", "COMPLETED"]).optional(),
});

export const POST = async (request: NextRequest, ctx: RouteContext<"/api/prescription/[id]/medication">) => {
  await authenticate();
  const { id } = await parseParams(ctx.params, paramsSchema);
  const body = await parseBody(request, bodySchema);
  const service = new AddMedicationToPrescription(new DrizzlePrescriptionRepository());

  return routeHandler(
    async () => {
      await service.execute(
        id,
        body.name,
        body.dosage,
        body.dosageUnit,
        body.frequency,
        body.administrationMethod,
        body.startDate,
        body.alternatives?.map((item) => ({
          name: item.name,
          brand: item.brand,
          dosage: item.dosage,
          dosage_unit: item.dosageUnit,
          administration_method: item.administrationMethod,
        })),
        body.endDate,
        body.notes,
        body.state as MedicationStateValues,
      );

      return HttpNextResponse.noContent();
    },
    (error: PrescriptionNotFound | NotAuthorized | InvalidArgument) => {
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

