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
  badgeClassName,
  type Diagnosis,
  diagnosisCertaintyLabels,
  diagnosisStateClasses,
  diagnosisStateLabels,
  formatDateValue,
  isPagination,
  isRecord,
  PaginationSummary,
  toLabel,
} from "./tool-response-shared";

export const PatientDiagnosesToolResponse = ({ output }: { output: unknown }) => {
  if (!isRecord(output) || !Array.isArray(output.data)) {
    return null;
  }

  const diagnoses = output.data.filter(isRecord) as Diagnosis[];
  const pagination = isPagination(output.pagination) ? output.pagination : undefined;

  return (
    <div className="space-y-4">
      <PaginationSummary pagination={pagination} />
      <div className="grid gap-3">
        {diagnoses.map((diagnosis, index) => (
          <Card
            className="rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/25 shadow-sm"
            key={diagnosis.id ?? `${diagnosis.summary}-${index}`}
            size="sm"
          >
            <CardHeader className="pb-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>{diagnosis.summary ?? "Diagnóstico sin resumen"}</CardTitle>
                  <CardDescription>{diagnosis.cie_code ?? "Sin código CIE"}</CardDescription>
                </div>
                <Badge className={badgeClassName(diagnosisStateClasses[diagnosis.state ?? ""])} variant="outline">
                  {toLabel(diagnosis.state, diagnosisStateLabels)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 pt-3">
              <Badge variant="secondary">{toLabel(diagnosis.certainty, diagnosisCertaintyLabels)}</Badge>
              <Badge variant="outline">{toLabel(diagnosis.type)}</Badge>
              <Badge variant="outline">{toLabel(diagnosis.income)}</Badge>
              {diagnosis.created_at ? <Badge variant="outline">{formatDateValue(diagnosis.created_at)}</Badge> : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
