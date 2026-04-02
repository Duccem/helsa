"use client";

import { MedicationStateValues } from "@/modules/prescription/domain/medication";
import { Primitives } from "@/modules/shared/domain/primitives";
import { Badge } from "@/modules/shared/presentation/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/presentation/components/ui/card";
import { Separator } from "@/modules/shared/presentation/components/ui/separator";
import { format } from "date-fns";
import { Activity, Calendar, Pill, Syringe } from "lucide-react";
import { useAppointmentDetail } from "./provider";
import { usePatientMedications } from "../../hooks/use-appointment-details";
import { Medication } from "@/modules/prescription/domain/medication";

const stateConfig: Record<
  MedicationStateValues,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  [MedicationStateValues.ACTIVE]: { label: "Activo", variant: "default" },
  [MedicationStateValues.PENDING]: { label: "Pendiente", variant: "outline" },
  [MedicationStateValues.PAUSED]: { label: "Pausado", variant: "secondary" },
  [MedicationStateValues.COMPLETED]: { label: "Completado", variant: "secondary" },
};

function MedicationCard({ medication }: { medication: Primitives<Medication> }) {
  const state = stateConfig[medication.state as MedicationStateValues] ?? {
    label: medication.state,
    variant: "outline",
  };
  const startDate = format(new Date(medication.start_date), "dd MMM yyyy");
  const endDate = medication.end_date ? format(new Date(medication.end_date), "dd MMM yyyy") : "Indefinido";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Pill className="size-4 text-muted-foreground shrink-0" />
            <CardTitle className="text-base">{medication.name}</CardTitle>
          </div>
          <Badge variant={state.variant}>{state.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Dosis</span>
            <span className="font-medium">
              {medication.dosage} {medication.dosage_unit}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="size-3" />
              Frecuencia
            </span>
            <span className="font-medium">{medication.frequency}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Syringe className="size-3" />
              Administración
            </span>
            <span className="font-medium">{medication.administration_method}</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3.5" />
          <span>
            {startDate} — {endDate}
          </span>
        </div>

        {medication.notes && (
          <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-3">{medication.notes}</p>
        )}

        {medication.alternatives && medication.alternatives.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Alternativas</span>
            <div className="flex flex-wrap gap-1.5">
              {medication.alternatives.map((alt, i) => (
                <Badge key={i} variant="outline" className="text-xs font-normal">
                  {alt.name} {alt.dosage} {alt.dosage_unit}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AppointmentMedications() {
  const { medications, isPendingMedications } = useAppointmentDetail();

  if (isPendingMedications) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="h-28 animate-pulse bg-muted rounded-md" />
          </Card>
        ))}
      </div>
    );
  }

  if (medications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <Pill className="size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium">Sin medicamentos registrados</p>
          <p className="text-xs text-muted-foreground">Este paciente no tiene medicamentos activos en el sistema.</p>
        </CardContent>
      </Card>
    );
  }

  const active = medications.filter((m) => m.state === MedicationStateValues.ACTIVE);
  const others = medications.filter((m) => m.state !== MedicationStateValues.ACTIVE);

  return (
    <div className="flex flex-col gap-4">
      {active.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Activos ({active.length})
          </h3>
          {active.map((medication) => (
            <MedicationCard key={medication.id} medication={medication} />
          ))}
        </div>
      )}

      {others.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Otros ({others.length})
          </h3>
          {others.map((medication) => (
            <MedicationCard key={medication.id} medication={medication} />
          ))}
        </div>
      )}
    </div>
  );
}

