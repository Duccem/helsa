"use client";

import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Activity,
  ClipboardList,
  FileText,
  HeartPulse,
  Loader2,
  ShieldAlert,
  Stethoscope,
  Thermometer,
  Trash2,
  UserRound,
  Weight,
  X,
} from "lucide-react";
import { type ComponentType, useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/presentation/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/modules/shared/presentation/components/ui/field";
import { Input } from "@/modules/shared/presentation/components/ui/input";
import { ScrollArea } from "@/modules/shared/presentation/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/presentation/components/ui/select";
import { Textarea } from "@/modules/shared/presentation/components/ui/textarea";
import { cn } from "@/modules/shared/presentation/lib/utils";
import { useCallAppointment } from "../hooks/use-call-appointment";

const statusOptions = [
  { value: "SCHEDULED", label: "Programada" },
  { value: "IN_PROGRESS", label: "En curso" },
  { value: "FINISHED", label: "Finalizada" },
  { value: "CANCELLED", label: "Cancelada" },
] as const;

const noteSchema = z.object({
  note: z.string().min(1, "La nota no puede estar vacía"),
});

const vitalsSchema = z.object({
  bloodPressure: z.union([z.number().positive("Debe ser mayor a 0"), z.undefined()]),
  heartRate: z.union([z.number().positive("Debe ser mayor a 0"), z.undefined()]),
  respiratoryRate: z.union([z.number().positive("Debe ser mayor a 0"), z.undefined()]),
  oxygenSaturation: z.union([z.number().min(0).max(100, "Debe ser entre 0 y 100"), z.undefined()]),
  temperature: z.union([z.number().positive("Debe ser mayor a 0"), z.undefined()]),
});

type CallDoctorPanelProps = {
  appointmentId: string;
  open: boolean;
  onCloseAction: () => void;
};

const calculateAge = (birthDate?: string | Date) => {
  if (!birthDate) return "-";
  const date = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }
  return `${age} años`;
};

const formatAppointmentDate = (date?: string | Date, hour?: string) => {
  if (!date) return "Sin fecha";
  return `${format(new Date(date), "PPP", { locale: es })}${hour ? ` · ${hour.slice(0, 5)}` : ""}`;
};

const formatGender = (gender?: string) => {
  switch (gender) {
    case "MAN":
      return "Hombre";
    case "WOMAN":
      return "Mujer";
    case "OTHER":
      return "Otro";
    default:
      return "-";
  }
};

const MetricCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) => (
  <div className="rounded-2xl border border-border/70 bg-muted/60 p-3 text-foreground shadow-sm">
    <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
      <Icon className="size-3.5 text-primary" />
      <span>{label}</span>
    </div>
    <div className="text-lg font-semibold">{value}</div>
  </div>
);

export const CallDoctorPanel = ({ appointmentId, open, onCloseAction }: CallDoctorPanelProps) => {
  const { appointment, patient, isLoading, addNote, removeNote, updateStatus, addVitals } =
    useCallAppointment(appointmentId);
  const [selectedStatus, setSelectedStatus] = useState(appointment?.status ?? "SCHEDULED");

  useEffect(() => {
    if (appointment?.status) {
      setSelectedStatus(appointment.status);
    }
  }, [appointment?.status]);

  const latestVitals = patient?.vitals?.[0];
  const physicalInformation = patient?.physical_information;

  const noteForm = useForm({
    defaultValues: { note: "" },
    validators: { onSubmit: noteSchema },
    onSubmit: async ({ value }) => {
      await addNote.mutateAsync(value.note);
      noteForm.reset();
    },
  });

  const vitalsForm = useForm({
    defaultValues: {
      bloodPressure: undefined as number | undefined,
      heartRate: undefined as number | undefined,
      respiratoryRate: undefined as number | undefined,
      oxygenSaturation: undefined as number | undefined,
      temperature: undefined as number | undefined,
    },
    validators: { onSubmit: vitalsSchema },
    onSubmit: async ({ value }) => {
      await addVitals.mutateAsync(value);
      vitalsForm.reset();
    },
  });

  return (
    <aside
      className={cn(
        "pointer-events-none absolute inset-y-0 right-0 z-30 flex w-full max-w-[440px] flex-col p-3 transition-all duration-300 md:p-4",
        open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0",
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-border/80 bg-background/95 text-foreground shadow-[0_24px_80px_rgba(15,23,42,0.28)] backdrop-blur-xl",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div className="border-b border-border/70 bg-gradient-to-br from-primary/12 via-background/95 to-secondary px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-primary/80">Cabina clínica</p>
              <h2 className="mt-1 font-serif text-2xl leading-none text-foreground">Control de consulta</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Notas, estado clínico y contexto del paciente sin salir de la videollamada.
              </p>
            </div>
            <button
              type="button"
              onClick={onCloseAction}
              aria-label="Cerrar panel clínico"
              className="flex size-10 items-center justify-center rounded-full border border-border/70 bg-background/70 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-4 p-4">
            <Card className="border border-border/70 bg-card/95 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                  <ClipboardList className="size-4 text-primary" />
                  Resumen de la cita
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-foreground">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Cargando información...
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <MetricCard
                        label="Estado"
                        value={statusOptions.find((item) => item.value === appointment?.status)?.label ?? "Sin estado"}
                        icon={Stethoscope}
                      />
                      <MetricCard
                        label="Fecha"
                        value={formatAppointmentDate(appointment?.date, appointment?.hour)}
                        icon={Activity}
                      />
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/35 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Motivo</p>
                      <p className="mt-2 text-sm leading-6 text-foreground">
                        {appointment?.motive ?? "Sin motivo registrado"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <FieldLabel>Actualizar estado</FieldLabel>
                      <div className="flex gap-2">
                        <Select
                          value={selectedStatus}
                          onValueChange={(value) => setSelectedStatus(value ?? "SCHEDULED")}
                        >
                          <SelectTrigger className="border-border bg-background">
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          onClick={() => updateStatus.mutate(selectedStatus)}
                          disabled={updateStatus.isPending}
                          className="shadow-sm"
                        >
                          {updateStatus.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                          Guardar
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border border-border/70 bg-card/95 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                  <UserRound className="size-4 text-primary" />
                  Ficha del paciente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-foreground">
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard label="Nombre" value={patient?.name ?? "Sin nombre"} icon={UserRound} />
                  <MetricCard label="Edad" value={calculateAge(patient?.birth_date)} icon={Activity} />
                  <MetricCard label="Género" value={formatGender(patient?.gender)} icon={ClipboardList} />
                  <MetricCard label="Sangre" value={physicalInformation?.blood_type ?? "-"} icon={ShieldAlert} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <MetricCard
                    label="Peso"
                    value={physicalInformation?.weight ? `${physicalInformation.weight} kg` : "-"}
                    icon={Weight}
                  />
                  <MetricCard
                    label="Altura"
                    value={physicalInformation?.height ? `${physicalInformation.height} cm` : "-"}
                    icon={Activity}
                  />
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/35 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Alergias relevantes</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {patient?.allergies?.length ? (
                      patient.allergies.map((allergy) => (
                        <span
                          key={allergy.id}
                          className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                        >
                          {allergy.name} · {allergy.severity}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin alergias registradas</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/70 bg-card/95 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                  <HeartPulse className="size-4 text-primary" />
                  Signos vitales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-foreground">
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard
                    label="Presión"
                    value={latestVitals?.blood_pressure ? `${latestVitals.blood_pressure} mmHg` : "-"}
                    icon={HeartPulse}
                  />
                  <MetricCard
                    label="Pulso"
                    value={latestVitals?.heart_rate ? `${latestVitals.heart_rate} lpm` : "-"}
                    icon={Activity}
                  />
                  <MetricCard
                    label="Respiración"
                    value={latestVitals?.respiratory_rate ? `${latestVitals.respiratory_rate} rpm` : "-"}
                    icon={Stethoscope}
                  />
                  <MetricCard
                    label="O2"
                    value={latestVitals?.oxygen_saturation ? `${latestVitals.oxygen_saturation}%` : "-"}
                    icon={ShieldAlert}
                  />
                  <MetricCard
                    label="Temperatura"
                    value={latestVitals?.temperature ? `${latestVitals.temperature} °C` : "-"}
                    icon={Thermometer}
                  />
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    vitalsForm.handleSubmit();
                  }}
                  className="space-y-3 rounded-2xl border border-border/70 bg-muted/35 p-4"
                >
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Registrar nueva medición
                    </p>
                  </div>
                  <FieldGroup className="grid grid-cols-2 gap-3">
                    <vitalsForm.Field name="bloodPressure">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>Presión arterial</FieldLabel>
                          <Input
                            id={field.name}
                            type="number"
                            value={field.state.value ?? ""}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="120"
                          />
                        </Field>
                      )}
                    </vitalsForm.Field>
                    <vitalsForm.Field name="heartRate">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>Frecuencia cardíaca</FieldLabel>
                          <Input
                            id={field.name}
                            type="number"
                            value={field.state.value ?? ""}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="72"
                          />
                        </Field>
                      )}
                    </vitalsForm.Field>
                    <vitalsForm.Field name="respiratoryRate">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>Frecuencia respiratoria</FieldLabel>
                          <Input
                            id={field.name}
                            type="number"
                            value={field.state.value ?? ""}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="18"
                          />
                        </Field>
                      )}
                    </vitalsForm.Field>
                    <vitalsForm.Field name="oxygenSaturation">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>Saturación de oxígeno</FieldLabel>
                          <Input
                            id={field.name}
                            type="number"
                            value={field.state.value ?? ""}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="98"
                          />
                        </Field>
                      )}
                    </vitalsForm.Field>
                    <vitalsForm.Field name="temperature">
                      {(field) => (
                        <Field className="col-span-2">
                          <FieldLabel htmlFor={field.name}>Temperatura</FieldLabel>
                          <Input
                            id={field.name}
                            type="number"
                            step="0.1"
                            value={field.state.value ?? ""}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="36.5"
                          />
                        </Field>
                      )}
                    </vitalsForm.Field>
                  </FieldGroup>
                  <Button type="submit" disabled={addVitals.isPending} className="w-full shadow-sm">
                    {addVitals.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Guardar signos vitales
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border border-border/70 bg-card/95 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                  <FileText className="size-4 text-primary" />
                  Notas de la cita
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-foreground">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    noteForm.handleSubmit();
                  }}
                  className="space-y-3 rounded-2xl border border-border/70 bg-muted/35 p-4"
                >
                  <FieldGroup>
                    <noteForm.Field name="note">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>Nueva nota</FieldLabel>
                          <Textarea
                            id={field.name}
                            rows={4}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Registrar observaciones, plan o hallazgos clínicos..."
                          />
                        </Field>
                      )}
                    </noteForm.Field>
                  </FieldGroup>
                  <Button type="submit" disabled={addNote.isPending} className="w-full shadow-sm">
                    {addNote.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Guardar nota
                  </Button>
                </form>

                <div className="space-y-3">
                  {appointment?.notes?.length ? (
                    appointment.notes.map((note) => (
                      <div key={note.id} className="rounded-2xl border border-border/70 bg-muted/35 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm leading-6 text-foreground">{note.note}</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {format(new Date(note.created_at), "PPPp", { locale: es })}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeNote.mutate(note.id)}
                            className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            aria-label="Eliminar nota"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-4 text-center text-muted-foreground">
                      No hay notas registradas todavía.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
};

