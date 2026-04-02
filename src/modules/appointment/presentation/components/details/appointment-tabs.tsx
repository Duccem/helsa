import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/modules/shared/presentation/components/ui/tabs";
import { AllergiesAlert, ConditionsSection, ReasonForVisit, VitalsGrid } from "./appointment-overview";
import { AppointmentMedications } from "./appointment-medications";
import { AppointmentHistory } from "./appointment-history";
import { AppointmentNotes } from "./appointment-notes";

export function AppointmentTabs() {
  return (
    <Tabs defaultValue="overview">
      <TabsList variant="line">
        <TabsTrigger value="overview">Resumen</TabsTrigger>
        <TabsTrigger value="medications">Medicamentos</TabsTrigger>
        <TabsTrigger value="history">Historial</TabsTrigger>
        <TabsTrigger value="notes">Notas</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="flex flex-col gap-4 pt-4">
        <ReasonForVisit />
        <VitalsGrid />
        <AllergiesAlert />
        <ConditionsSection />
      </TabsContent>

      <TabsContent value="medications" className="pt-4">
        <AppointmentMedications />
      </TabsContent>

      <TabsContent value="history" className="pt-4">
        <AppointmentHistory />
      </TabsContent>

      <TabsContent value="notes" className="pt-4">
        <AppointmentNotes />
      </TabsContent>
    </Tabs>
  );
}

