import { AiInsights } from "@/modules/appointment/presentation/components/details/ai-insights";
import { AppointmentHeader } from "@/modules/appointment/presentation/components/details/appointment-header";
import {
  AiActionsCard,
  AppointmentDetailsCard,
  PatientInfoCard,
} from "@/modules/appointment/presentation/components/details/appointment-sidebar";
import { AppointmentTabs } from "@/modules/appointment/presentation/components/details/appointment-tabs";

const mockInsights = [
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

const mockAiActions = [
  { label: "Generate referral letter" },
  { label: "Summarize patient history" },
  { label: "Suggest treatment plan" },
];

export default function AppointmentDetailsPage() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <AppointmentHeader
        patientName="John Anderson"
        status="FINISHED"
        date="March 28, 2026"
        startTime="08:00 AM"
        endTime="08:30 AM"
        type="Consultation"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main Content */}
        <div className="flex flex-col gap-6">
          <AiInsights insights={mockInsights} />
          <AppointmentTabs />
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <PatientInfoCard
            name="John Anderson"
            gender="Male"
            age={45}
            dateOfBirth="Jun 12, 1980"
            phone="+1 (555) 234-5678"
            email="john.anderson@email.com"
            bloodType="A+"
          />
          <AppointmentDetailsCard
            date="March 28, 2026"
            time="08:00 AM – 08:30 AM"
            mode="In Person"
            type="Consultation"
          />
          <AiActionsCard actions={mockAiActions} />
        </div>
      </div>
    </div>
  );
}

