import { tool } from "ai";
import z from "zod";
import { GetAppointmentDetails } from "@/modules/appointment/application/get-appointment-details";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";

export const getAppointmentDetailsTool = tool({
  description:
    "Retrieves full details of a specific appointment by its ID, including patient info, motive, notes, payment, and rating. Use this when you need to examine a particular appointment in depth.",
  inputSchema: z.object({
    appointment_id: z.string().describe("The unique identifier of the appointment."),
  }),
  execute: async (args) => {
    const useCase = container.get(GetAppointmentDetails);
    const appointment = await useCase.execute(args.appointment_id);
    return appointment.toPrimitives();
  },
});

