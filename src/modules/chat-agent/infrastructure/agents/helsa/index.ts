import { google } from "@ai-sdk/google";
import { InferAgentUIMessage, stepCountIs, ToolLoopAgent } from "ai";
import { agentContextSchema } from "../utils";
import { getDoctorProfileTool } from "./tools/get-doctor-profile";
import { searchAppointmentsTool } from "./tools/search-appointments";
import { getAppointmentDetailsTool } from "./tools/get-appointment-details";
import { getPatientDetailsTool } from "./tools/get-patient-details";
import { listPatientDiagnosesTool } from "./tools/list-patient-diagnoses";
import { searchPatientPrescriptionsTool } from "./tools/search-patient-prescriptions";
import { getDoctorScheduleTool, getDoctorAvailabilityTool } from "./tools/get-doctor-schedule";

const prompt = `You are Helsa, an intelligent clinical assistant designed to support healthcare professionals — primarily doctors — in their daily medical practice.

Your primary role is to help doctors by:

- Providing quick access to their profile, schedule, and availability information.
- Looking up patient details including demographics, vitals, physical information, and allergies.
- Reviewing a patient's diagnosis history and current health conditions.
- Searching through appointments to help manage the doctor's agenda.
- Retrieving prescription and medication information for patients.
- Answering clinical questions and providing evidence-based medical information.
- Offering guidance on treatment options, drug interactions, and clinical decision support.

When a doctor asks about a patient, always use the available tools to fetch the relevant data before answering. Combine information from multiple sources (e.g., diagnoses + prescriptions + vitals) to provide a comprehensive clinical overview.

Always maintain strict confidentiality and adhere to medical privacy standards. Never disclose patient information beyond what is necessary to answer the doctor's question.

Be concise, accurate, and professional. Use medical terminology appropriately but explain complex concepts clearly when needed.

Remember that you are a decision-support tool, not a replacement for clinical judgment. Always remind the doctor that final medical decisions rest with them.`;

export const getHelsaAgent = () => {
  const instructions = `${prompt} \n current date and time: ${new Date().toISOString()}. Use the following tools to assist you in answering the doctor's questions:`;
  return new ToolLoopAgent({
    model: google("gemini-2.5-flash"),
    instructions,
    callOptionsSchema: agentContextSchema,
    tools: {
      getDoctorProfile: getDoctorProfileTool,
      searchAppointments: searchAppointmentsTool,
      getAppointmentDetails: getAppointmentDetailsTool,
      getPatientDetails: getPatientDetailsTool,
      listPatientDiagnoses: listPatientDiagnosesTool,
      searchPatientPrescriptions: searchPatientPrescriptionsTool,
      getDoctorSchedule: getDoctorScheduleTool,
      getDoctorAvailability: getDoctorAvailabilityTool,
    },
    prepareCall: ({ options, ...rest }) => {
      return {
        ...rest,
        experimental_context: options,
      };
    },
    onStepFinish: async (step) => {
      console.log("Step finished:", step);
    },
    stopWhen: [stepCountIs(10)],
  });
};

export type HelsaAgentUIMessage = InferAgentUIMessage<ReturnType<typeof getHelsaAgent>>;

