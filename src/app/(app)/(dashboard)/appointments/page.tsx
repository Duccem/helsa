import {
  AppointmentFilterCalendar,
  AppointmentFilters,
} from "@/modules/appointment/presentation/components/dashboard/filters";
import { AppointmentList } from "@/modules/appointment/presentation/components/dashboard/list";
import { AppointmentMetrics } from "@/modules/appointment/presentation/components/dashboard/metrics";
import { AppointmentsProvider } from "@/modules/appointment/presentation/components/dashboard/provider";
import { QuickActions } from "@/modules/appointment/presentation/components/dashboard/quick-actions";
import { AppointmentSummary } from "@/modules/appointment/presentation/components/dashboard/summary";
import { requireAuth } from "@/modules/auth/infrastructure/guards/require-auth";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function AppointmentsPage() {
  const session = await requireAuth();

  return (
    <div className="p-4 flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
        <div className="flex  flex-col gap-2">
          <h1 className="text-2xl font-bold">Citas</h1>
          <p>Hola, {session.user.name}! aquí puedes manejar tus citas de manera cómoda.</p>
        </div>
        <Link href={"/appointments/new"}>
          <Button className={"cursor-pointer"}>
            <Plus />
            New Appointment
          </Button>
        </Link>
      </div>
      <div className="flex flex-col gap-6 w-full">
        <AppointmentsProvider>
          <AppointmentMetrics />
          <AppointmentSummary />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="col-span-1 md:col-span-4 flex flex-col gap-4">
              <AppointmentFilters />
              <AppointmentList />
            </div>
            <div className="col-span-1 flex flex-col gap-4">
              <AppointmentFilterCalendar />
              <QuickActions />
            </div>
          </div>
        </AppointmentsProvider>
      </div>
    </div>
  );
}

