"use client";

import { Card, CardContent } from "@/modules/shared/presentation/components/ui/card";
import { Ban, CalendarDays, CheckCircle, Loader2, Target } from "lucide-react";
import { useAppointments } from "./provider";

export const AppointmentMetrics = () => {
  const { dayStats, isFetchingStats } = useAppointments();
  const total = dayStats.length;
  const completed = dayStats.filter((a) => a.status === "FINISHED").length;
  const pending = dayStats.filter((a) => a.status === "READY").length;
  const cancelled = dayStats.filter((a) => a.status === "CANCELLED").length;

  if (isFetchingStats) {
    return <AppointmentMetricsSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
      <Card className="max-sm:rounded-b-none md:rounded-r-none">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de citas</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
            <div className="flex flex-col items-end">
              <CalendarDays className="size-5 text-indigo-400" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-none">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completadas</p>
              <p className="text-2xl font-bold">{completed}</p>
            </div>
            <div className="flex flex-col items-end">
              <CheckCircle className="size-4 text-emerald-500" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-none">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Por atender</p>
              <p className="text-2xl font-bold">{pending}</p>
            </div>
            <div className="flex flex-col items-end">
              <Target className="size-4 text-amber-500" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="max-sm:rounded-t-none md:rounded-l-none">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Canceladas</p>
              <p className="text-2xl font-bold">{cancelled}</p>
            </div>
            <div className="flex flex-col items-end">
              <Ban className="size-4 text-rose-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const AppointmentMetricsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
      <Card className="animate-pulse max-sm:rounded-b-none md:rounded-r-none">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Cargando...</p>
              <p className="text-2xl font-bold">&nbsp;</p>
            </div>
            <div className="flex flex-col items-end">
              <Loader2 className="size-5 animate-spin text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="animate-pulse  md:rounded-none">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Cargando...</p>
              <p className="text-2xl font-bold">&nbsp;</p>
            </div>
            <div className="flex flex-col items-end">
              <Loader2 className="size-5 animate-spin text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="animate-pulse  md:rounded-none">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Cargando...</p>
              <p className="text-2xl font-bold">&nbsp;</p>
            </div>
            <div className="flex flex-col items-end">
              <Loader2 className="size-5 animate-spin text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="animate-pulse max-sm:rounded-t-none md:rounded-l-none">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Cargando...</p>
              <p className="text-2xl font-bold">&nbsp;</p>
            </div>
            <div className="flex flex-col items-end">
              <Loader2 className="size-5 animate-spin text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

