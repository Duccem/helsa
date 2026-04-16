"use client";

import type { ComponentType, ReactNode } from "react";
import { AppointmentDetailsToolResponse } from "./appointment-details-tool-response";
import { PatientDetailsToolResponse } from "./patient-details-tool-response";
import { PatientDiagnosesToolResponse } from "./patient-diagnoses-tool-response";
import { PatientPrescriptionsToolResponse } from "./patient-prescriptions-tool-response";
import { SearchAppointmentsToolResponse } from "./search-appointments-tool-response";

export const toolTitles: Record<string, string> = {
  searchAppointments: "Buscar citas",
  getAppointmentDetails: "Detalle de cita",
  getPatientDetails: "Datos del paciente",
  listPatientDiagnoses: "Diagnósticos del paciente",
  searchPatientPrescriptions: "Recetas del paciente",
  getDoctorProfile: "Perfil del médico",
  getDoctorSchedule: "Horario del médico",
  getDoctorAvailability: "Disponibilidad del médico",
};

const toolResultComponents = {
  searchAppointments: SearchAppointmentsToolResponse,
  getAppointmentDetails: AppointmentDetailsToolResponse,
  getPatientDetails: PatientDetailsToolResponse,
  listPatientDiagnoses: PatientDiagnosesToolResponse,
  searchPatientPrescriptions: PatientPrescriptionsToolResponse,
} satisfies Record<string, ComponentType<{ output: unknown }>>;

export type RenderableToolName = keyof typeof toolResultComponents;

export const getToolTitle = (toolName: string) => {
  return toolTitles[toolName] ?? toolName;
};

export const isRenderableToolName = (toolName: string): toolName is RenderableToolName => {
  return toolName in toolResultComponents;
};

export const renderToolResult = (toolName: string, output: unknown): ReactNode => {
  if (!isRenderableToolName(toolName)) {
    return null;
  }

  const Component = toolResultComponents[toolName];

  return <Component output={output} />;
};
