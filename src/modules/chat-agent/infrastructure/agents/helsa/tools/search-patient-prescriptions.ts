import { tool } from "ai";
import z from "zod";
import { SearchPrescriptions } from "@/modules/prescription/application/search-prescriptions";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { GetDoctorProfile } from "@/modules/doctor/application/get-doctor-profile";
import { getRequiredContext } from "../../utils";

export const searchPatientPrescriptionsTool = tool({
  description:
    "Searches prescriptions associated with a patient or issued by the current doctor. Returns a list of prescriptions including medications, dosages, frequencies, administration methods, and observations. Use this to review a patient's current and past medication regimens.",
  inputSchema: z.object({
    patient_id: z.string().optional().describe("Filter prescriptions for a specific patient."),
    query: z.string().optional().describe("Search term to filter prescriptions by observation or medication name."),
    page: z.number().int().min(1).optional().default(1).describe("Page number for pagination."),
    pageSize: z.number().int().min(1).max(20).optional().default(10).describe("Number of results per page."),
  }),
  execute: async (args, options) => {
    const { user_id } = getRequiredContext(options.experimental_context);
    const doctorProfile = await container.get(GetDoctorProfile).execute(user_id);
    const useCase = container.get(SearchPrescriptions);

    const result = await useCase.execute({
      doctor_id: doctorProfile.id,
      patient_id: args.patient_id,
      query: args.query,
      page: args.page,
      pageSize: args.pageSize,
    });

    return {
      data: result.data.map((p) => p.toPrimitives()),
      pagination: result.pagination,
    };
  },
});

