"use client";

import { Card, CardContent } from "@/modules/shared/presentation/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FileText, History } from "lucide-react";
import { useAppointmentDetail } from "./provider";

const typeLabels: Record<string, string> = {
  CONSULTATION: "Consulta",
  FOLLOW_UP: "Seguimiento",
  CHECK_UP: "Chequeo",
  EMERGENCY: "Emergencia",
  PROCEDURE: "Procedimiento",
};

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

