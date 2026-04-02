"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/presentation/components/ui/card";
import { cn } from "@/modules/shared/presentation/lib/utils";
import { Activity, AlertTriangle, Droplets, Heart, Thermometer, Wind } from "lucide-react";
import { useAppointmentDetail } from "./provider";

// -- Reason for Visit --

export function ReasonForVisit() {
  const { appointment, isPendingAppointment } = useAppointmentDetail();

  if (isPendingAppointment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Razón de consulta</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Razón de consulta</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{appointment?.motive}</p>
      </CardContent>
    </Card>
  );
}

// -- Vitals --

interface Vital {
  label: string;
  value: string;
  icon: "heart" | "activity" | "thermometer" | "droplets" | "wind";
  color: string;
}

const vitalIcons = {
  heart: Heart,
  activity: Activity,
  thermometer: Thermometer,
  droplets: Droplets,
  wind: Wind,
} as const;

function VitalCard({ vital }: { vital: Vital }) {
  const Icon = vitalIcons[vital.icon];
  return (
    <Card className="flex flex-col items-center justify-center py-6">
      <CardContent className="flex flex-col items-center gap-2 p-0">
        <Icon className={cn("size-5", vital.color)} />
        <p className="text-xl font-bold">{vital.value}</p>
        <p className="text-xs text-muted-foreground">{vital.label}</p>
      </CardContent>
    </Card>
  );
}

const vitalsConfig: Record<string, { label: string; icon: Vital["icon"] }> = {
  blood_pressure: { label: "Presion sanguinea", icon: "heart" },
  heart_rate: { label: "Ritmo cardíaco", icon: "activity" },
  temperature: { label: "Temperatura", icon: "thermometer" },
  oxygen_saturation: { label: "SpO₂", icon: "droplets" },
  respiratory_rate: { label: "Frecuencia respiratoria", icon: "wind" },
};

export function VitalsGrid() {
  const { patient, isPendingPatient } = useAppointmentDetail();

  if (isPendingPatient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vitals</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">Loading...</CardContent>
      </Card>
    );
  }

  if (!patient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vitals</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">No patient data found.</CardContent>
      </Card>
    );
  }
  const lastVitals = patient.vitals?.[0];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      <VitalCard
        vital={{
          label: vitalsConfig.blood_pressure.label,
          value: lastVitals ? `${lastVitals.blood_pressure} mmHg` : "-",
          icon: vitalsConfig.blood_pressure.icon,
          color: "text-red-500",
        }}
      />
      <VitalCard
        vital={{
          label: vitalsConfig.heart_rate.label,
          value: lastVitals ? `${lastVitals.heart_rate} bpm` : "-",
          icon: vitalsConfig.heart_rate.icon,
          color: "text-violet-500",
        }}
      />
      <VitalCard
        vital={{
          label: vitalsConfig.temperature.label,
          value: lastVitals ? `${lastVitals.temperature} °C` : "-",
          icon: vitalsConfig.temperature.icon,
          color: "text-amber-500",
        }}
      />
      <VitalCard
        vital={{
          label: vitalsConfig.oxygen_saturation.label,
          value: lastVitals ? `${lastVitals.oxygen_saturation} %` : "-",
          icon: vitalsConfig.oxygen_saturation.icon,
          color: "text-cyan-500",
        }}
      />
      <VitalCard
        vital={{
          label: vitalsConfig.respiratory_rate.label,
          value: lastVitals ? `${lastVitals.respiratory_rate} /min` : "-",
          icon: vitalsConfig.respiratory_rate.icon,
          color: "text-slate-500",
        }}
      />
    </div>
  );
}

// -- Allergies --

interface AllergiesAlertProps {
  allergies: string[];
}

export function AllergiesAlert({ allergies }: AllergiesAlertProps) {
  if (allergies.length === 0) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/20">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
      <div>
        <p className="text-sm font-medium text-red-600 dark:text-red-400">Allergies</p>
        <p className="text-sm text-red-600/80 dark:text-red-400/80">{allergies.join(", ")}</p>
      </div>
    </div>
  );
}

