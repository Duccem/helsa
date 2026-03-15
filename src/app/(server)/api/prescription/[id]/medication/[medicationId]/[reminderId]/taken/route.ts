import { MarkReminderAsTaken } from "@/modules/prescription/application/mark-reminder-as-taken";
import { MedicationReminderNotFound } from "@/modules/prescription/domain/medication-not-found";
import { PrescriptionNotFound } from "@/modules/prescription/domain/prescription-not-found";
import { DrizzlePrescriptionRepository } from "@/modules/prescription/infrastructure/persistence/drizzle-prescription-repository";
import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseParams } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";
import z from "zod";

const paramsSchema = z.object({
  id: z.uuid(),
  reminderId: z.uuid(),
  medicationId: z.uuid(),
});

export const PUT = async (
  _: NextRequest,
  ctx: RouteContext<"/api/prescription/[id]/medication/[medicationId]/[reminderId]/taken">,
) => {
  await authenticate();
  const { id, reminderId, medicationId } = await parseParams(ctx.params, paramsSchema);
  const service = new MarkReminderAsTaken(new DrizzlePrescriptionRepository());

  return routeHandler(
    async () => {
      await service.execute(id, reminderId, medicationId);

      return HttpNextResponse.noContent();
    },
    (error: PrescriptionNotFound | MedicationReminderNotFound | InvalidArgument) => {
      switch (true) {
        case error instanceof PrescriptionNotFound:
          return HttpNextResponse.domainError(error, 404);
        case error instanceof MedicationReminderNotFound:
          return HttpNextResponse.domainError(error, 404);
        case error instanceof InvalidArgument:
          return HttpNextResponse.domainError(error, 400);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};

