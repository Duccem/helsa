"use client";

import { AppointmentDetailProvider } from "@/modules/appointment/presentation/components/details/provider";
import { AppointmentHeader } from "@/modules/appointment/presentation/components/details/appointment-header";
import { AiInsights } from "@/modules/appointment/presentation/components/details/ai-insights";
import { AppointmentTabs } from "@/modules/appointment/presentation/components/details/appointment-tabs";
import {
  AiActionsCard,
  AppointmentDetailsCard,
  PatientInfoCard,
} from "@/modules/appointment/presentation/components/details/appointment-sidebar";

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

export default function AppointmentDetailsPage() {
  return (
    <AppointmentDetailProvider>
      <div className="flex flex-col gap-6 p-4">
        <AppointmentHeader />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-6">
            <AiInsights insights={aiInsights} />
            <AppointmentTabs />
          </div>

          <div className="flex flex-col gap-4">
            <PatientInfoCard />
            <AppointmentDetailsCard />
            <AiActionsCard actions={aiActions} />
          </div>
        </div>
      </div>
    </AppointmentDetailProvider>
  );
}

