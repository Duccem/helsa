import type { NextRequest } from "next/server";
import z from "zod";
import { ScheduleAppointment } from "@/modules/appointment/application/schedule-appointment";
import type {
  AppointmentModeValues,
  AppointmentStatusValues,
  AppointmentTypeValues,
} from "@/modules/appointment/domain/appointment";
import { AppointmentNotFound } from "@/modules/appointment/domain/appointment-not-found";
import { DrizzleAppointmentRepository } from "@/modules/appointment/infrastructure/persistence/drizzle-appointment-repository";
import { InvalidArgument } from "@/modules/shared/domain/errors/invalid-argument";
import { authenticate, authenticateOrg } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseBody, parseQuery } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { SearchAppointments } from "@/modules/appointment/application/search-appointments";
import { DrizzleDoctorRepository } from "@/modules/doctor/infrastructure/persistence/drizzle-doctor-repository";
import { GetDoctorProfile } from "@/modules/doctor/application/get-doctor-profile";
import { GetPatientProfile } from "@/modules/patient/application/get-patient-profile";
import { DrizzlePatientRepository } from "@/modules/patient/infrastructure/persistence/drizzle-patient-repository";

const insertAppointmentSchema = z.object({
  date: z.coerce.date().describe("The date selected for the appointment."),
  hour: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Invalid time format. Expected HH:mm or HH:mm:ss")
    .describe("The hour selected for the appointment in 24h format (HH:mm or HH:mm:ss)."),
  patientId: z.uuid().describe("The unique identifier of the patient. given by the system."),
  doctorId: z.uuid().describe("The unique identifier of the doctor selected by the patient."),
  motive: z.string().describe("The reason for the appointment."),
  mode: z.enum(["ONLINE", "IN_PERSON"]),
  type: z.enum(["CONSULTATION", "FOLLOW_UP", "CHECK_UP", "EMERGENCY", "PROCEDURE"]),
  organizationId: z.uuid().optional(),
  amount: z.coerce.number().min(0).describe("The fee for the appointment."),
  payment_mode: z.enum(["PREPAID", "POSTPAID", "CREDIT"]).describe("The payment method for the appointment."),
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
        body.hour,
        body.motive,
        body.type,
        body.mode,
        body.amount,
        body.payment_mode,
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
  state: z.enum(["SCHEDULED", "IN_PROGRESS", "CANCELLED", "FINISHED"]).optional(),
  doctorId: z.uuid().optional(),
  patientId: z.uuid().optional(),
  mode: z.enum(["ONLINE", "IN_PERSON"]).optional(),
  type: z.enum(["CONSULTATION", "FOLLOW_UP", "CHECK_UP", "EMERGENCY", "PROCEDURE"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  hour: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Invalid time format. Expected HH:mm or HH:mm:ss")
    .optional(),
  sort: z.enum(["date", "status", "created_at"]).default("date"),
  order: z.enum(["ASC", "DESC"]).default("ASC"),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  organizationId: z.uuid().optional(),
});

export const GET = async (request: NextRequest) => {
  const { session } = await authenticate();
  const query = parseQuery(request, searchAppointmentsSchema);
  const service = new SearchAppointments(new DrizzleAppointmentRepository());

  return routeHandler(
    async () => {
      let doctorId = query.doctorId;
      let patientId = query.patientId;
      let orgId = query.organizationId;

      if (session.user.role === "doctor") {
        const doctorService = new GetDoctorProfile(new DrizzleDoctorRepository());
        const doctorProfile = await doctorService.execute(session.user.id);
        doctorId = doctorProfile.id;
      }

      if (session.user.role === "patient") {
        const patientService = new GetPatientProfile(new DrizzlePatientRepository());
        const patientProfile = await patientService.execute(session.user.id);
        patientId = patientProfile.id;
      }

      if (session.user.role === "admin") {
        const org = await authenticateOrg();
        orgId = org.id;
      }

      const result = await service.execute({
        organization_id: orgId,
        doctor_id: doctorId,
        patient_id: patientId,
        status: query.state as AppointmentStatusValues | undefined,
        mode: query.mode as AppointmentModeValues | undefined,
        type: query.type as AppointmentTypeValues | undefined,
        date_from: query.startDate,
        date_to: query.endDate,
        hour: query.hour,
        sort: query.sort,
        order: query.order,
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

