"use client";

import { Badge } from "@/modules/shared/presentation/components/ui/badge";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/modules/shared/presentation/components/ui/dropdown-menu";
import { cn } from "@/modules/shared/presentation/lib/utils";
import { ArrowLeft, Loader2, MoreHorizontal, Printer, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppointmentDetail } from "./provider";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { CopyPatientLinkButton } from "./copy-patient-link-button";
import { StartAppointmentButton } from "./start-appointment-button";

const statusLabels = {
  SCHEDULED: "Agendada",
  IN_PROGRESS: "En Curso",
  CANCELLED: "Cancelada",
  FINISHED: "Completada",
} as const;

const statusStyles = {
  SCHEDULED: "border-indigo-500/50 text-indigo-500",
  IN_PROGRESS: "bg-emerald-500/20 border-emerald-500/50 text-emerald-500",
  CANCELLED: "border-red-500/50 text-red-500",
  FINISHED: "bg-emerald-500/20 border-emerald-500/50 text-emerald-500",
} as const;

const typeLabels: Record<string, string> = {
  CONSULTATION: "Consulta",
  FOLLOW_UP: "Seguimiento",
  CHECK_UP: "Chequeo",
  EMERGENCY: "Emergencia",
  PROCEDURE: "Procedimiento",
};

type AppointmentStatus = keyof typeof statusLabels;

export function AppointmentHeader() {
  const router = useRouter();

  const { appointment, isPendingAppointment } = useAppointmentDetail();

  if (isPendingAppointment || !appointment) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="mt-1" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{appointment?.patient?.name ?? ""}</h1>
            <Badge
              variant="outline"
              className={cn("rounded-full", statusStyles[appointment?.status as AppointmentStatus])}
            >
              {statusLabels[appointment?.status as AppointmentStatus]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(appointment?.date ?? new Date()), "MMMM d, yyyy", { locale: es })} ·{" "}
            {format(new Date(`1970-01-01T${appointment?.hour}`), "hh:mm a", { locale: es })} ·{" "}
            {typeLabels[appointment?.type ?? ""] ?? appointment?.type}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {appointment?.status !== "CANCELLED" && appointment?.status !== "FINISHED" && (
          <>
            <CopyPatientLinkButton appointmentId={appointment.id} />
            <StartAppointmentButton appointmentId={appointment.id} />
          </>
        )}
        <Button variant="ghost" size="icon">
          <Printer className="size-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Share2 className="size-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <Link href={`/dashboard/appointments/${appointment.id}/reschedule`}>
              <DropdownMenuItem>Reagendar</DropdownMenuItem>
            </Link>
            <DropdownMenuItem className="text-destructive">Cancelar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

