"use client";

import { Card, CardContent } from "@/modules/shared/presentation/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, FileText, Loader2, Star, Users } from "lucide-react";
import { DoctorHomeMetrics } from "../../domain/home-metric";

export const DoctorMetrics = () => {
  const { data, isFetching } = useQuery<DoctorHomeMetrics>({
    queryKey: ["doctor-metrics"],
    initialData: {
      total_patients: 0,
      total_appointments: 0,
      in_progress_appointments: 0,
      pending_records: 0,
      patient_satisfaction: 0,
    },
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await fetch("/api/home/doctor");
      if (!response.ok) {
        throw new Error("Error fetching doctor metrics");
      }
      const data = await response.json();
      return data.metrics as DoctorHomeMetrics;
    },
  });
  if (isFetching) {
    return <DoctorMetricsSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
      <Card className="max-sm:rounded-b-none md:rounded-r-none">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de pacientes</p>
              <p className="text-2xl font-bold">{data.total_patients}</p>
            </div>
            <div className="flex flex-col items-end">
              <Users className="size-5 text-indigo-400" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-none">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de citas</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{data.total_appointments}</p>
                <p>
                  <span className="text-xs text-muted-foreground">En progreso: </span>
                  <span className="text-xs text-amber-500">{data.in_progress_appointments}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <CalendarDays className="size-4 text-emerald-500" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-none">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Registros pendientes</p>
              <p className="text-2xl font-bold">{data.pending_records}</p>
            </div>
            <div className="flex flex-col items-end">
              <FileText className="size-4 text-amber-500" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="max-sm:rounded-t-none md:rounded-l-none">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Satisfaccion de los pacientes</p>
              <p className="text-2xl font-bold">{data.patient_satisfaction}</p>
            </div>
            <div className="flex flex-col items-end">
              <Star className="size-4 text-emerald-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const DoctorMetricsSkeleton = () => {
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

