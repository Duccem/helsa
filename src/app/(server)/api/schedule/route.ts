import { CreateSchedule } from "@/modules/schedule/application/create-schedule";
import { ScheduleAlreadyExists } from "@/modules/schedule/domain/schedule-already-exists";
import { DrizzleScheduleRepository } from "@/modules/schedule/infrastructure/persistence/drizzle-schedule-repository";
import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseBody } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";
import z from "zod";

const scheduleDaySchema = z.object({
  day: z.coerce.number().int().min(0).max(6),
  startHour: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
  endHour: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
});

const createScheduleSchema = z.object({
  doctorId: z.uuid(),
  appointmentDuration: z.coerce.number().int().positive(),
  maxAppointmentsPerDay: z.coerce.number().int().positive(),
  days: z.array(scheduleDaySchema).min(1),
});

export const POST = async (request: NextRequest) => {
  await authenticate();
  const body = await parseBody(request, createScheduleSchema);
  const service = new CreateSchedule(new DrizzleScheduleRepository());

  return routeHandler(
    async () => {
      await service.execute(
        body.doctorId,
        body.appointmentDuration,
        body.maxAppointmentsPerDay,
        body.days.map((item) => ({
          day: item.day,
          start_hour: item.startHour,
          end_hour: item.endHour,
        })),
      );

      return HttpNextResponse.created();
    },
    (error: ScheduleAlreadyExists | InvalidArgument) => {
      switch (true) {
        case error instanceof ScheduleAlreadyExists:
          return HttpNextResponse.domainError(error, 409);
        case error instanceof InvalidArgument:
          return HttpNextResponse.domainError(error, 400);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};

