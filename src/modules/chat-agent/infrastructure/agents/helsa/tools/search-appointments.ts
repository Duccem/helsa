import { tool } from "ai";
import z from "zod";
import { SearchAppointments } from "@/modules/appointment/application/search-appointments";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { GetDoctorProfile } from "@/modules/doctor/application/get-doctor-profile";
import { getRequiredContext } from "../../utils";

export const searchAppointmentsTool = tool({
  description:
    "Searches and lists appointments for the current doctor. Can filter by date range, patient, status (PENDING, CONFIRMED, COMPLETED, CANCELLED), and mode (ONLINE, IN_PERSON). Returns paginated results with appointment details including patient info, date, hour, motive, type, and status.",
  inputSchema: z.object({
    date_from: z.coerce.string().optional().describe("Filter appointments from this date (ISO format)."),
    date_to: z.coerce.string().optional().describe("Filter appointments up to this date (ISO format)."),
    patient_id: z.string().optional().describe("Filter by a specific patient ID."),
    status: z
      .enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"])
      .optional()
      .describe("Filter by appointment status."),
    mode: z.enum(["ONLINE", "IN_PERSON"]).optional().describe("Filter by appointment mode."),
    page: z.number().int().min(1).optional().default(1).describe("Page number for pagination."),
    pageSize: z.number().int().min(1).max(20).optional().default(10).describe("Number of results per page."),
  }),
  execute: async (args, options) => {
    const { user_id } = getRequiredContext(options.experimental_context);
    const doctorProfile = await container.get(GetDoctorProfile).execute(user_id);
    const useCase = container.get(SearchAppointments);

    const result = await useCase.execute({
      doctor_id: doctorProfile.id,
      patient_id: args.patient_id,
      date_from: new Date(args.date_from!),
      date_to: new Date(args.date_to!),
      status: args.status as any,
      mode: args.mode as any,
      page: args.page,
      pageSize: args.pageSize,
    });

    return result;
  },
});

