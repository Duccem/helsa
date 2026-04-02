"use client";

import { format, differenceInYears } from "date-fns";
import { Loader2 } from "lucide-react";
import { AiInsights } from "./ai-insights";
import { AppointmentHeader } from "./appointment-header";
import { AiActionsCard, AppointmentDetailsCard, PatientInfoCard } from "./appointment-sidebar";
import { AppointmentTabs } from "./appointment-tabs";
import { useAppointmentDetail } from "./provider";

const modeLabels: Record<string, string> = {
  ONLINE: "Online",
  IN_PERSON: "In Person",
};

const typeLabels: Record<string, string> = {
  CONSULTATION: "Consultation",
  FOLLOW_UP: "Follow Up",
  CHECK_UP: "Check Up",
  EMERGENCY: "Emergency",
  PROCEDURE: "Procedure",
};

const aiInsights = [
  {
    type: "warning" as const,
    message: "BP trending upward over last 3 visits — consider medication adjustment",
  },
  {
    type: "info" as const,
    message: "LDL cholesterol 142 mg/dL — above target of 100 mg/dL",
  },
  {
    type: "recommendation" as const,
    message: "Recommend cardiac stress test based on symptom pattern",
  },
];

const aiActions = [
  { label: "Generate referral letter" },
  { label: "Summarize patient history" },
  { label: "Suggest treatment plan" },
];

export function AppointmentDetailContent() {
  const { appointment, isFetching } = useAppointmentDetail();

  if (isFetching || !appointment) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const appointmentDate = format(new Date(appointment.date), "MMMM d, yyyy");
  const startTime = format(new Date(`1970-01-01T${appointment.hour}`), "hh:mm a");
  const modeLabel = modeLabels[appointment.mode] ?? appointment.mode;
  const typeLabel = typeLabels[appointment.type] ?? appointment.type;

  const patient = appointment.patient;
  const patientAge = patient?.birth_date ? differenceInYears(new Date(), new Date(patient.birth_date)) : 0;
  const patientDob = patient?.birth_date ? format(new Date(patient.birth_date), "MMM d, yyyy") : "";

  return (
    <div className="flex flex-col gap-6 p-4">
      <AppointmentHeader
        patientName={patient?.name ?? "Unknown Patient"}
        status={appointment.status as "SCHEDULED" | "IN_PROGRESS" | "CANCELLED" | "FINISHED"}
        date={appointmentDate}
        startTime={startTime}
        endTime=""
        type={typeLabel}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <AiInsights insights={aiInsights} />
          <AppointmentTabs />
        </div>

        <div className="flex flex-col gap-4">
          <PatientInfoCard patientId={appointment.patient_id} />
          <AppointmentDetailsCard date={appointmentDate} time={startTime} mode={modeLabel} type={typeLabel} />
          <AiActionsCard actions={aiActions} />
        </div>
      </div>
    </div>
  );
}

