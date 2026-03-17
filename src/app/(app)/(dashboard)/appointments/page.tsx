import { AppointmentsDashboard } from "@/modules/appointment/presentation/components/appointments-dashboard";
import { AppointmentsFilter } from "@/modules/appointment/presentation/components/filter/appointment-filter";
import { AppointmentsFilterList } from "@/modules/appointment/presentation/components/filter/appointment-filter-list";
import { ViewSwitcher } from "@/modules/appointment/presentation/components/view-switcher";
import { requireAuth } from "@/modules/auth/infrastructure/guards/require-auth";

export default async function AppointmentsPage() {
  const session = await requireAuth();

  return (
    <div className="p-4 flex flex-col gap-4 w-full">
      <h1 className="text-2xl font-bold">Appointments</h1>
      <p>Welcome, {session.user.name}! Here you can manage your appointments.</p>
      <div className="flex flex-col gap-6 w-full">
        <div className="flex items-center gap-4">
          <ViewSwitcher />
          <AppointmentsFilter />
          <AppointmentsFilterList />
        </div>
        <AppointmentsDashboard />
      </div>
    </div>
  );
}

