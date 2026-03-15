import { ScheduleAppointment } from "@/modules/appointment/application/schedule-appointment";
import { SearchAppointments } from "@/modules/appointment/application/search-appointments";
import { AppointmentNotFound } from "@/modules/appointment/domain/appointment-not-found";
import { DrizzleAppointmentRepository } from "@/modules/appointment/infrastructure/persistence/drizzle-appointment-repository";
import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseBody, parseQuery } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";
import z from "zod";

const insertAppointmentSchema = z.object({
  date: z.coerce.date().describe("The date selected for the appointment."),
  patientId: z.uuid().describe("The unique identifier of the patient. given by the system."),
  doctorId: z.uuid().describe("The unique identifier of the doctor selected by the patient."),
  motive: z.string().describe("The reason for the appointment."),
  mode: z.enum(["ONLINE", "IN_PERSON"]),
  type: z.enum(["THERAPY", "INITIAL"]),
  organizationId: z.uuid().optional(),
});

export const POST = async (request: NextRequest) => {
  await authenticate();
  const body = await parseBody(request, insertAppointmentSchema);
  const service = new ScheduleAppointment(new DrizzleAppointmentRepository());

  return routeHandler(
    async () => {
      await service.execute(
        body.organizationId || null,
        body.patientId,
        body.doctorId,
        body.date,
        body.motive,
        body.type,
        body.mode,
      );

      return HttpNextResponse.created();
    },
    (error: AppointmentNotFound | InvalidArgument) => {
      switch (true) {
        case error instanceof AppointmentNotFound:
          return HttpNextResponse.domainError(error, 404);
        case error instanceof InvalidArgument:
          return HttpNextResponse.domainError(error, 400);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};

const searchAppointmentsSchema = z.object({
  state: z
    .enum([
      "SCHEDULED",
      "CONFIRMED",
      "PAYED",
      "READY",
      "STARTED",
      "CANCELLED",
      "MISSED_BY_PATIENT",
      "MISSED_BY_THERAPIST",
      "FINISHED",
    ])
    .optional(),
  doctorId: z.uuid().optional(),
  patientId: z.uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  organizationId: z.uuid().optional(),
});

export const GET = async (request: NextRequest) => {
  await authenticate();
  const query = parseQuery(request, searchAppointmentsSchema);
  const service = new SearchAppointments(new DrizzleAppointmentRepository());

  return routeHandler(
    async () => {
      const result = await service.execute({
        organization_id: query.organizationId,
        doctor_id: query.doctorId,
        patient_id: query.patientId,
        status: query.state as any,
        date_from: query.startDate,
        date_to: query.endDate,
        page: query.page,
        pageSize: query.pageSize,
      });

      return HttpNextResponse.json(result);
    },
    (_error: unknown) => {
      return HttpNextResponse.internalServerError();
    },
  );
};

