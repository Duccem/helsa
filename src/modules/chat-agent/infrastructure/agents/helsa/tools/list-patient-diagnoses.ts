import { tool } from "ai";
import z from "zod";
import { ListDiagnoses } from "@/modules/diagnosis/application/list-diagnoses";
import { DiagnosisCertaintyValues, DiagnosisStateValues } from "@/modules/diagnosis/domain/diagnosis";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";

export const listPatientDiagnosesTool = tool({
  description:
    "Lists the diagnoses registered for a specific patient. Returns diagnosis history including CIE codes, certainty levels (PRESUMPTIVE, DIFFERENTIAL, DEFINITIVE, DISCARD), states (ACTIVE, REMISSION, CURED, RECURRENT, DECEASED), income type, and summaries. Use this to review a patient's medical history and current health conditions.",
  inputSchema: z.object({
    patient_id: z.string().describe("The unique identifier of the patient."),
    state: z
      .enum(["ACTIVE", "REMISSION", "CURED", "RECURRENT", "DECEASED"])
      .optional()
      .describe("Filter by diagnosis state."),
    certainty: z
      .enum(["PRESUMPTIVE", "DIFFERENTIAL", "DEFINITIVE", "DISCARD"])
      .optional()
      .describe("Filter by diagnosis certainty level."),
    query: z.string().optional().describe("Search term to filter diagnoses by name or CIE code."),
    page: z.number().int().min(1).optional().default(1).describe("Page number for pagination."),
    pageSize: z.number().int().min(1).max(20).optional().default(10).describe("Number of results per page."),
  }),
  execute: async (args) => {
    const useCase = container.get(ListDiagnoses);
    const result = await useCase.execute({
      patient_id: args.patient_id,
      state: args.state as DiagnosisStateValues,
      certainty: args.certainty as DiagnosisCertaintyValues,
      query: args.query,
      page: args.page,
      pageSize: args.pageSize,
    });
    return result;
  },
});

