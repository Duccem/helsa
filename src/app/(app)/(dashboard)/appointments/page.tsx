import { AppointmentsDashboard } from "@/modules/appointment/presentation/components/appointments-dashboard";
import { requireAuth } from "@/modules/auth/infrastructure/guards/require-auth";

export default async function AppointmentsPage() {
  const session = await requireAuth();

  return (
    <div className="p-4 flex flex-col gap-4 w-full">
      <h1 className="text-2xl font-bold">Appointments</h1>
      <p>Welcome, {session.user.name}! Here you can manage your appointments.</p>
      <AppointmentsDashboard />
    </div>
  );
}

