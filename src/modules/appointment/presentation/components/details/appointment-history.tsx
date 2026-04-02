"use client";

import { Appointment } from "@/modules/appointment/domain/appointment";
import { Primitives } from "@/modules/shared/domain/primitives";
import { Badge } from "@/modules/shared/presentation/components/ui/badge";
import { Card, CardContent } from "@/modules/shared/presentation/components/ui/card";
import { cn } from "@/modules/shared/presentation/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, FileText, History, MapPin, Video } from "lucide-react";
import Link from "next/link";
import { useAppointmentDetail } from "./provider";
import { usePatientDoctorHistory } from "../../hooks/use-appointment-details";

const statusConfig: Record<string, { label: string; className: string }> = {
  FINISHED: {
    label: "Completada",
    className: "border-blue-500/50 text-blue-500",
  },
  CANCELLED: {
    label: "Cancelada",
    className: "border-red-500/50 text-red-500",
  },
};

const typeLabels: Record<string, string> = {
  CONSULTATION: "Consulta",
  FOLLOW_UP: "Seguimiento",
  CHECK_UP: "Chequeo",
  EMERGENCY: "Emergencia",
  PROCEDURE: "Procedimiento",
};

function HistoryItem({ appointment }: { appointment: Primitives<Appointment> }) {
  const status = statusConfig[appointment.status] ?? { label: appointment.status, className: "" };
  const date = new Date(appointment.date);

  return (
    <Link href={`/appointments/${appointment.id}`}>
      <Card className="transition-all hover:bg-accent/60 border cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex flex-col items-center justify-center bg-muted rounded-lg px-3 py-2 shrink-0 min-w-[64px]">
                <span className="text-xs text-muted-foreground uppercase font-medium">
                  {format(date, "MMM", { locale: es })}
                </span>
                <span className="text-xl font-bold leading-none">{format(date, "dd")}</span>
                <span className="text-xs text-muted-foreground">{format(date, "yyyy")}</span>
              </div>

              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={cn("rounded-full text-xs shrink-0", status.className)}>
                    {status.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {typeLabels[appointment.type] ?? appointment.type}
                  </span>
                </div>

                <p className="text-sm font-medium leading-snug line-clamp-2">{appointment.motive}</p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3 shrink-0" />
                    {format(new Date(`2000-01-01T${appointment.hour}`), "p")}
                  </span>
                  <span className="flex items-center gap-1">
                    {appointment.mode === "ONLINE" ? (
                      <Video className="size-3 shrink-0" />
                    ) : (
                      <MapPin className="size-3 shrink-0" />
                    )}
                    {appointment.mode === "ONLINE" ? "Online" : "Presencial"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function HistorySkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="h-24 animate-pulse bg-muted rounded-md" />
        </Card>
      ))}
    </div>
  );
}

export function AppointmentHistory() {
  const { history, isPendingHistory } = useAppointmentDetail();

  if (isPendingHistory) {
    return <HistorySkeleton />;
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <History className="size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium">Sin historial de citas</p>
          <p className="text-xs text-muted-foreground">No hay citas anteriores registradas con este médico.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {history.map((a, i) => (
        <div key={a.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10">
              <FileText className="h-3.5 w-3.5 text-indigo-500" />
            </div>
            {i < history.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
          </div>
          <div className="pb-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{typeLabels[a.type]}</p>
              <span className="text-xs text-muted-foreground">{format(new Date(a.date), "PP", { locale: es })}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{a.motive}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

