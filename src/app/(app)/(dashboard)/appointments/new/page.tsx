import { NewAppointmentForm } from "@/modules/appointment/presentation/components/appointment-form";
import { BackButton } from "@/modules/shared/presentation/components/back-button";

export default function NewAppointmentPage() {
  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <BackButton compact />
        <h1 className="font-light text-xl">New Appointment</h1>
      </div>
      <NewAppointmentForm />
    </div>
  );
}

