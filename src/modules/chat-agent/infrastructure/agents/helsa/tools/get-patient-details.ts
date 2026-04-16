import { tool } from "ai";
import z from "zod";
import { GetPatientDetails } from "@/modules/patient/application/get-patient-details";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";

export const getPatientDetailsTool = tool({
  description:
    "Retrieves comprehensive information about a patient by their ID, including personal data (name, birth date, gender), vitals (blood pressure, heart rate, temperature, etc.), physical information (height, weight, BMI), allergies, and contact information. Use this to get a complete clinical picture of the patient.",
  inputSchema: z.object({
    patient_id: z.string().describe("The unique identifier of the patient."),
  }),
  execute: async (args) => {
    const useCase = container.get(GetPatientDetails);
    const patient = await useCase.execute(args.patient_id);
    return patient;
  },
});

