import { UpdateMedication } from "@/modules/prescription/application/update-medication";
import { MedicationNotFound } from "@/modules/prescription/domain/medication-not-found";
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
  medicationId: z.uuid(),
});

const alternativeDrugSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  dosage: z.string().min(1),
  dosageUnit: z.string().min(1),
  administrationMethod: z.string().min(1),
});

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  dosage: z.coerce.number().positive().optional(),
  dosageUnit: z.string().min(1).optional(),
  frequency: z.string().min(1).optional(),
  administrationMethod: z.string().min(1).optional(),
  alternatives: z.array(alternativeDrugSchema).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.union([z.coerce.date(), z.null()]).optional(),
  notes: z.union([z.string().min(1), z.null()]).optional(),
  state: z.enum(["PENDING", "ACTIVE", "PAUSED", "COMPLETED"]).optional(),
});

export const PUT = async (
  request: NextRequest,
  ctx: RouteContext<"/api/prescription/[id]/medication/[medicationId]">,
) => {
  const { organization } = await authenticate();
  const { id, medicationId } = await parseParams(ctx.params, paramsSchema);
  const body = await parseBody(request, bodySchema);
  const service = new UpdateMedication(new DrizzlePrescriptionRepository());

  return routeHandler(
    async () => {
      await service.execute(id, medicationId, organization.id, {
        name: body.name,
        dosage: body.dosage,
        dosage_unit: body.dosageUnit,
        frequency: body.frequency,
        administration_method: body.administrationMethod,
        alternatives: body.alternatives?.map((item) => ({
          name: item.name,
          brand: item.brand,
          dosage: item.dosage,
          dosage_unit: item.dosageUnit,
          administration_method: item.administrationMethod,
        })),
        start_date: body.startDate,
        end_date: body.endDate,
        notes: body.notes,
        state: body.state as MedicationStateValues,
      });

      return HttpNextResponse.noContent();
    },
    (error: PrescriptionNotFound | MedicationNotFound | NotAuthorized | InvalidArgument) => {
      switch (true) {
        case error instanceof PrescriptionNotFound:
          return HttpNextResponse.domainError(error, 404);
        case error instanceof MedicationNotFound:
          return HttpNextResponse.domainError(error, 404);
        case error instanceof NotAuthorized:
          return HttpNextResponse.domainError(error, 403);
        case error instanceof InvalidArgument:
          return HttpNextResponse.domainError(error, 400);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};

