"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/presentation/components/ui/card";
import { cn } from "@/modules/shared/presentation/lib/utils";
import { Activity, AlertTriangle, Droplets, Heart, Stethoscope, Thermometer, Wind } from "lucide-react";
import { useAppointmentDetail } from "./provider";
import { Badge } from "@/modules/shared/presentation/components/ui/badge";
import { Button } from "@/modules/shared/presentation/components/ui/button";

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
    <div className="flex flex-col  gap-4">
      <div className="flex justify-end">
        <Button>Agregar medicion</Button>
      </div>
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
    </div>
  );
}

export function AllergiesAlert() {
  const { patient, isPendingPatient } = useAppointmentDetail();
  if (isPendingPatient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alergias</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">Cargando...</CardContent>
      </Card>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-destructive" />
          Alergias
        </CardTitle>
      </CardHeader>
      <CardContent>
        {patient.allergies && patient.allergies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {patient.allergies.map((allergy, index) => (
              <Badge key={allergy.id} variant={"outline"} className="text-xs rounded-full border-indigo-500">
                {allergy.name}
              </Badge>
            ))}
          </div>
        ) : (
          <></>
        )}
      </CardContent>
    </Card>
  );
}

const stateLabels: Record<string, string> = {
  ACTIVE: "Activo",
  REMISSION: "Remisión",
  CURED: "Curado",
  RECURRENT: "Recurrente",
  DECEASED: "Fallecido",
};

const stateColors: Record<string, string> = {
  ACTIVE: "border-red-500 text-red-600",
  REMISSION: "border-yellow-500 text-yellow-600",
  CURED: "border-green-500 text-green-600",
  RECURRENT: "border-orange-500 text-orange-600",
  DECEASED: "border-slate-500 text-slate-600",
};

export function ConditionsSection() {
  const { diagnoses, isPendingDiagnoses } = useAppointmentDetail();

  if (isPendingDiagnoses) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Condiciones</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">Cargando...</CardContent>
      </Card>
    );
  }

  if (!diagnoses || diagnoses.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="size-4 text-muted-foreground" />
          Condiciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {diagnoses.map((diagnosis) => (
            <div key={diagnosis.id} className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{diagnosis.summary}</span>
                <span className="text-xs text-muted-foreground">{diagnosis.cie_code}</span>
              </div>
              <Badge variant="outline" className={cn("text-xs rounded-full shrink-0", stateColors[diagnosis.state])}>
                {stateLabels[diagnosis.state] ?? diagnosis.state}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

