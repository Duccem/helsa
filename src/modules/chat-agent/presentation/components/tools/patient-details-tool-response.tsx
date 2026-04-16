"use client";

import { Badge } from "@/modules/shared/presentation/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/shared/presentation/components/ui/card";
import {
  ActivityIcon,
  AlertTriangleIcon,
  HeartPulseIcon,
  RulerIcon,
  ThermometerIcon,
  UserRoundIcon,
  WeightIcon,
} from "lucide-react";
import {
  allergySeverityClasses,
  allergySeverityLabels,
  badgeClassName,
  formatDateValue,
  isRecord,
  MetricCard,
  type Patient,
  toLabel,
} from "./tool-response-shared";

export const PatientDetailsToolResponse = ({ output }: { output: unknown }) => {
  if (!isRecord(output)) {
    return null;
  }

  const patient = output as Patient;
  const contactInfo =
    Array.isArray(patient.contact_info) && patient.contact_info.length > 0 ? patient.contact_info[0] : undefined;
  const latestVitals = Array.isArray(patient.vitals) && patient.vitals.length > 0 ? patient.vitals[0] : undefined;
  const physical = isRecord(patient.physical_information) ? patient.physical_information : undefined;
  const allergies = Array.isArray(patient.allergies) ? patient.allergies : [];

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-sky-50/80 via-background to-background shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserRoundIcon className="size-6" />
              </div>
              <div>
                <CardTitle className="text-base">{patient.name ?? "Paciente sin nombre"}</CardTitle>
                <CardDescription>{patient.email ?? "Sin correo registrado"}</CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{toLabel(patient.gender)}</Badge>
              <Badge variant="outline">Nacimiento {formatDateValue(patient.birth_date)}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={<WeightIcon className="size-3.5" />}
              label="Peso"
              value={physical?.weight ? `${physical.weight} kg` : "Sin dato"}
            />
            <MetricCard
              icon={<RulerIcon className="size-3.5" />}
              label="Altura"
              value={physical?.height ? `${physical.height} cm` : "Sin dato"}
            />
            <MetricCard
              icon={<ActivityIcon className="size-3.5" />}
              label="IMC"
              value={physical?.body_mass_index ? `${physical.body_mass_index}` : "Sin dato"}
            />
            <MetricCard
              icon={<HeartPulseIcon className="size-3.5" />}
              label="Tipo de sangre"
              value={physical?.blood_type ?? "Sin dato"}
            />
          </div>

          {latestVitals ? (
            <div className="rounded-3xl border border-border/70 bg-background/80 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <HeartPulseIcon className="size-4" />
                Signos vitales recientes
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <MetricCard
                  icon={<HeartPulseIcon className="size-3.5" />}
                  label="Presión"
                  value={latestVitals.blood_pressure ? `${latestVitals.blood_pressure} mmHg` : "Sin dato"}
                />
                <MetricCard
                  icon={<ActivityIcon className="size-3.5" />}
                  label="Pulso"
                  value={latestVitals.heart_rate ? `${latestVitals.heart_rate} bpm` : "Sin dato"}
                />
                <MetricCard
                  icon={<ThermometerIcon className="size-3.5" />}
                  label="Temperatura"
                  value={latestVitals.temperature ? `${latestVitals.temperature} °C` : "Sin dato"}
                />
                <MetricCard
                  icon={<HeartPulseIcon className="size-3.5" />}
                  label="SpO2"
                  value={latestVitals.oxygen_saturation ? `${latestVitals.oxygen_saturation}%` : "Sin dato"}
                />
                <MetricCard
                  icon={<ActivityIcon className="size-3.5" />}
                  label="Frecuencia respiratoria"
                  value={latestVitals.respiratory_rate ? `${latestVitals.respiratory_rate} rpm` : "Sin dato"}
                />
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-border/70 bg-background/80 p-4">
              <div className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Alergias registradas
              </div>
              {allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {allergies.map((allergy, index) => (
                    <Badge
                      className={badgeClassName(allergySeverityClasses[allergy.severity ?? ""])}
                      key={allergy.id ?? `${allergy.name}-${index}`}
                      variant="outline"
                    >
                      {allergy.name ?? "Alergia"}
                      {allergy.severity ? ` · ${toLabel(allergy.severity, allergySeverityLabels)}` : ""}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangleIcon className="size-4" />
                  No hay alergias registradas.
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-border/70 bg-background/80 p-4">
              <div className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Contacto</div>
              <div className="space-y-2 text-sm text-foreground">
                <div>
                  <span className="text-muted-foreground">Teléfono: </span>
                  <span className="font-medium">{contactInfo?.phone ?? "Sin dato"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Dirección: </span>
                  <span className="font-medium">{contactInfo?.address ?? "Sin dato"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
