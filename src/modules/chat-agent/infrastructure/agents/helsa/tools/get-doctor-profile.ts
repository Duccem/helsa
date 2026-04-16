import { tool } from "ai";
import z from "zod";
import { GetDoctorProfile } from "@/modules/doctor/application/get-doctor-profile";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { getRequiredContext } from "../../utils";

export const getDoctorProfileTool = tool({
  description:
    "Retrieves the current doctor's profile including specialty, license number, bio, experience, education, office address, and prices. Use this to get context about the doctor using the assistant.",
  inputSchema: z.object({}),
  execute: async (_args, options) => {
    const { user_id } = getRequiredContext(options.experimental_context);
    const useCase = container.get(GetDoctorProfile);
    const profile = await useCase.execute(user_id);
    return profile;
  },
});

