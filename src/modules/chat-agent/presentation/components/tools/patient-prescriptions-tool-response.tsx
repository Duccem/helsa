"use client";

import { Badge } from "@/modules/shared/presentation/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/shared/presentation/components/ui/card";
import { ActivityIcon, ClipboardListIcon, PillIcon, SyringeIcon } from "lucide-react";
import {
  badgeClassName,
  formatDateValue,
  isPagination,
  isRecord,
  medicationStateClasses,
  medicationStateLabels,
  MetricCard,
  PaginationSummary,
  type Prescription,
  toLabel,
} from "./tool-response-shared";

export const PatientPrescriptionsToolResponse = ({ output }: { output: unknown }) => {
  if (!isRecord(output) || !Array.isArray(output.data)) {
    return null;
  }

  const prescriptions = output.data.filter(isRecord) as Prescription[];
  const pagination = isPagination(output.pagination) ? output.pagination : undefined;

  return (
    <div className="space-y-4">
      <PaginationSummary pagination={pagination} />
      <div className="grid gap-3">
        {prescriptions.map((prescription, index) => {
          const medications = Array.isArray(prescription.medications) ? prescription.medications : [];

          return (
            <Card
              className="rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/25 shadow-sm"
              key={prescription.id ?? `${prescription.observation}-${index}`}
            >
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>{prescription.observation ?? "Prescripción sin observación"}</CardTitle>
                    <CardDescription>
                      {prescription.created_at
                        ? `Emitida el ${formatDateValue(prescription.created_at)}`
                        : "Fecha no disponible"}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{medications.length} medicamentos</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                {medications.length > 0 ? (
                  medications.map((medication, medicationIndex) => (
                    <div
                      className="rounded-2xl border border-border/70 bg-background/80 p-4"
                      key={medication.id ?? `${medication.name}-${medicationIndex}`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <PillIcon className="size-4 text-primary" />
                            {medication.name ?? "Medicamento"}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {typeof medication.dosage === "number"
                              ? `${medication.dosage} ${medication.dosage_unit ?? ""}`.trim()
                              : "Dosis no disponible"}
                          </div>
                        </div>
                        {medication.state ? (
                          <Badge
                            className={badgeClassName(medicationStateClasses[medication.state] ?? "")}
                            variant="outline"
                          >
                            {toLabel(medication.state, medicationStateLabels)}
                          </Badge>
                        ) : null}
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <MetricCard
                          icon={<ActivityIcon className="size-3.5" />}
                          label="Frecuencia"
                          value={medication.frequency ?? "Sin dato"}
                        />
                        <MetricCard
                          icon={<SyringeIcon className="size-3.5" />}
                          label="Administración"
                          value={medication.administration_method ?? "Sin dato"}
                        />
                        <MetricCard
                          icon={<ClipboardListIcon className="size-3.5" />}
                          label="Notas"
                          value={medication.notes ?? "Sin notas"}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    No hay medicamentos asociados a esta prescripción.
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
