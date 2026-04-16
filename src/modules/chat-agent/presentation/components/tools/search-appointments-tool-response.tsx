"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/presentation/components/ui/avatar";
import { Badge } from "@/modules/shared/presentation/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/shared/presentation/components/ui/card";
import {
  CalendarClockIcon,
  CalendarDaysIcon,
  CalendarSearchIcon,
  CircleDollarSignIcon,
  ClipboardListIcon,
  Clock3Icon,
} from "lucide-react";
import {
  type Appointment,
  type AppointmentPatient,
  appointmentStatusClasses,
  appointmentStatusLabels,
  badgeClassName,
  formatDateValue,
  formatMoney,
  getInitials,
  isPagination,
  isRecord,
  MetricCard,
  PaginationSummary,
  toLabel,
} from "./tool-response-shared";

export const SearchAppointmentsToolResponse = ({ output }: { output: unknown }) => {
  if (!isRecord(output) || !Array.isArray(output.data)) {
    return null;
  }

  const appointments = output.data.filter(isRecord) as Appointment[];
  const pagination = isPagination(output.pagination) ? output.pagination : undefined;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-background via-background to-muted/40 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CalendarSearchIcon className="size-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">Agenda encontrada</div>
            <div className="text-xs text-muted-foreground">Visualiza rápidamente las citas filtradas por Helsa.</div>
          </div>
        </div>
      </div>

      <PaginationSummary pagination={pagination} />

      <div className="grid gap-3">
        {appointments.map((appointment, index) => {
          const patient = isRecord(appointment.patient) ? (appointment.patient as AppointmentPatient) : undefined;
          const payment = isRecord(appointment.payment) ? appointment.payment : undefined;

          return (
            <Card
              className="overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/25 shadow-sm"
              key={appointment.id ?? `${appointment.motive}-${index}`}
              size="sm"
            >
              <CardHeader className="pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar size="lg">
                      <AvatarImage alt={patient?.name ?? "Paciente"} src={patient?.photo_url} />
                      <AvatarFallback>{getInitials(patient?.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{patient?.name ?? "Paciente sin nombre"}</CardTitle>
                      <CardDescription>{patient?.email ?? appointment.motive ?? "Sin detalle clínico"}</CardDescription>
                    </div>
                  </div>
                  <Badge
                    className={badgeClassName(appointmentStatusClasses[appointment.status ?? ""])}
                    variant="outline"
                  >
                    {toLabel(appointment.status, appointmentStatusLabels)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 pt-3">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    icon={<CalendarDaysIcon className="size-3.5" />}
                    label="Fecha"
                    value={formatDateValue(appointment.date)}
                  />
                  <MetricCard
                    icon={<Clock3Icon className="size-3.5" />}
                    label="Hora"
                    value={appointment.hour ?? "Sin hora"}
                  />
                  <MetricCard
                    icon={<ClipboardListIcon className="size-3.5" />}
                    label="Tipo"
                    value={toLabel(appointment.type)}
                  />
                  <MetricCard
                    icon={<CalendarClockIcon className="size-3.5" />}
                    label="Modalidad"
                    value={toLabel(appointment.mode)}
                  />
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Motivo</div>
                  <div className="mt-2 text-sm font-medium text-foreground">
                    {appointment.motive ?? "Sin motivo registrado"}
                  </div>
                </div>

                {payment && typeof payment.amount === "number" ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CircleDollarSignIcon className="size-4" />
                    <span>{formatMoney(payment.amount)}</span>
                    {payment.status ? <Badge variant="secondary">{toLabel(payment.status)}</Badge> : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
