"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/modules/shared/presentation/components/ui/tabs";
import {
  AllergiesAlert,
  ReasonForVisit,
  VitalsGrid,
} from "./appointment-overview";

const mockVitals = [
  {
    label: "Blood Pressure",
    value: "138/88",
    icon: "heart" as const,
    color: "text-red-500",
  },
  {
    label: "Heart Rate",
    value: "78 bpm",
    icon: "activity" as const,
    color: "text-violet-500",
  },
  {
    label: "Temperature",
    value: "98.4°F",
    icon: "thermometer" as const,
    color: "text-amber-500",
  },
  {
    label: "SpO₂",
    value: "97%",
    icon: "droplets" as const,
    color: "text-cyan-500",
  },
  {
    label: "Resp. Rate",
    value: "16/min",
    icon: "wind" as const,
    color: "text-slate-500",
  },
];

export function AppointmentTabs() {
  return (
    <Tabs defaultValue="overview">
      <TabsList variant="line">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="vitals">Vitals</TabsTrigger>
        <TabsTrigger value="medications">Medications</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="flex flex-col gap-4 pt-4">
        <ReasonForVisit
          title="Chest pain evaluation"
          description="Patient reports intermittent chest tightness during physical exertion. No pain at rest. Family history of cardiovascular disease."
        />
        <VitalsGrid vitals={mockVitals} />
        <AllergiesAlert allergies={["Penicillin", "Sulfa drugs"]} />
      </TabsContent>

      <TabsContent value="vitals" className="pt-4">
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          Vitals history will be displayed here.
        </div>
      </TabsContent>

      <TabsContent value="medications" className="pt-4">
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          Medications will be displayed here.
        </div>
      </TabsContent>

      <TabsContent value="history" className="pt-4">
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          Patient history will be displayed here.
        </div>
      </TabsContent>

      <TabsContent value="notes" className="pt-4">
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          Appointment notes will be displayed here.
        </div>
      </TabsContent>
    </Tabs>
  );
}
