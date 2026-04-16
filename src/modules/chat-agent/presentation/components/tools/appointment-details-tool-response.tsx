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
import { CalendarClockIcon, CalendarDaysIcon, ClipboardListIcon, Clock3Icon } from "lucide-react";
import {
  type Appointment,
  type AppointmentPatient,
  appointmentStatusClasses,
  appointmentStatusLabels,
  badgeClassName,
  formatDateValue,
  formatMoney,
  getInitials,
  isRecord,
  MetricCard,
  toLabel,
} from "./tool-response-shared";

export const AppointmentDetailsToolResponse = ({ output }: { output: unknown }) => {
  if (!isRecord(output)) {
    return null;
  }

  const appointment = output as Appointment;
  const patient = isRecord(appointment.patient) ? (appointment.patient as AppointmentPatient) : undefined;
  const notes = Array.isArray(appointment.notes) ? appointment.notes : [];
  const payment = isRecord(appointment.payment) ? appointment.payment : undefined;
  const rating = isRecord(appointment.rating) ? appointment.rating : undefined;

  return (
    <Card className="rounded-3xl border border-border/70 bg-gradient-to-br from-background via-background to-muted/35 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage alt={patient?.name ?? "Paciente"} src={patient?.photo_url} />
              <AvatarFallback>{getInitials(patient?.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{patient?.name ?? "Paciente"}</CardTitle>
              <CardDescription>{appointment.motive ?? "Sin motivo registrado"}</CardDescription>
            </div>
          </div>
          <Badge className={badgeClassName(appointmentStatusClasses[appointment.status ?? ""])} variant="outline">
            {toLabel(appointment.status, appointmentStatusLabels)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<CalendarDaysIcon className="size-3.5" />}
            label="Fecha"
            value={formatDateValue(appointment.date)}
          />
          <MetricCard icon={<Clock3Icon className="size-3.5" />} label="Hora" value={appointment.hour ?? "Sin dato"} />
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

        {payment && typeof payment.amount === "number" ? (
          <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Pago: </span>
            <span className="font-semibold text-foreground">{formatMoney(payment.amount)}</span>
          </div>
        ) : null}

        {rating && typeof rating.score === "number" ? (
          <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Calificación: </span>
            <span className="font-semibold text-foreground">{rating.score}/5</span>
            {typeof rating.comment === "string" && rating.comment.length > 0 ? (
              <div className="mt-2 text-muted-foreground">{rating.comment}</div>
            ) : null}
          </div>
        ) : null}

        {notes.length > 0 ? (
          <div className="rounded-3xl border border-border/70 bg-background/80 p-4">
            <div className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Notas de la cita
            </div>
            <div className="space-y-2">
              {notes.map((note, index) => (
                <div
                  className="rounded-2xl border border-border/60 bg-muted/20 px-3 py-2 text-sm text-foreground"
                  key={note.id ?? index}
                >
                  {note.content ?? note.note ?? "Nota sin contenido"}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
