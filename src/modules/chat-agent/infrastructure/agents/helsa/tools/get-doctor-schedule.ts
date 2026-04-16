import { tool } from "ai";
import z from "zod";
import { GetSchedule } from "@/modules/schedule/application/get-schedule";
import { GetAvailabilities } from "@/modules/schedule/application/get-availabilities";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { GetDoctorProfile } from "@/modules/doctor/application/get-doctor-profile";
import { getRequiredContext } from "../../utils";

export const getDoctorScheduleTool = tool({
  description:
    "Retrieves the current doctor's weekly schedule configuration including working days and hours. Use this to know when the doctor is available to see patients.",
  inputSchema: z.object({}),
  execute: async (_args, options) => {
    const { user_id } = getRequiredContext(options.experimental_context);
    const doctorProfile = await container.get(GetDoctorProfile).execute(user_id);
    const useCase = container.get(GetSchedule);
    const schedule = await useCase.execute(doctorProfile.id);
    return schedule;
  },
});

export const getDoctorAvailabilityTool = tool({
  description:
    "Retrieves the available and taken appointment slots for the current doctor within an optional date range. Returns a list of time slots with their state (AVAILABLE or TAKEN). Use this to check when the doctor has open slots or to understand their booking status.",
  inputSchema: z.object({
    date_from: z.coerce.date().optional().describe("Start date to filter availability slots (ISO format)."),
    date_to: z.coerce.date().optional().describe("End date to filter availability slots (ISO format)."),
    state: z
      .enum(["AVAILABLE", "TAKEN"])
      .optional()
      .describe("Filter slots by state: AVAILABLE (free) or TAKEN (booked)."),
  }),
  execute: async (args, options) => {
    const { user_id } = getRequiredContext(options.experimental_context);
    const doctorProfile = await container.get(GetDoctorProfile).execute(user_id);
    const useCase = container.get(GetAvailabilities);

    const slots = await useCase.execute(doctorProfile.id, args.date_from, args.date_to, args.state);

    return slots;
  },
});

