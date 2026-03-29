import { NewAppointmentForm } from "@/modules/appointment/presentation/components/new/form";
import { NewAppointmentProvider } from "@/modules/appointment/presentation/components/new/provider";
import { NewAppointmentSummary } from "@/modules/appointment/presentation/components/new/summary";
import { BackButton } from "@/modules/shared/presentation/components/back-button";

export default function NewAppointmentPage() {
  return (
    <div className=" flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <BackButton compact />
        <h1 className="font-light text-xl">Nueva cita medica</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NewAppointmentProvider>
          <NewAppointmentForm />
          <div>
            <NewAppointmentSummary />
          </div>
        </NewAppointmentProvider>
      </div>
    </div>
  );
}

