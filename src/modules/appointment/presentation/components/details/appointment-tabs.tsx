import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/modules/shared/presentation/components/ui/tabs";
import { AllergiesAlert, ReasonForVisit, VitalsGrid } from "./appointment-overview";
import { AppointmentMedications } from "./appointment-medications";

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
      </TabsContent>

      <TabsContent value="medications" className="pt-4">
        <AppointmentMedications />
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

