"use client";

import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Bot,
  FileText,
  HeartPulse,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  Stethoscope,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { Badge } from "@/modules/shared/presentation/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/modules/shared/presentation/components/ui/tabs";
import { Textarea } from "@/modules/shared/presentation/components/ui/textarea";
import { cn } from "@/modules/shared/presentation/lib/utils";
import type { JitsiChatMessage } from "../hooks/use-jitsi";
import { useCallAppointment } from "../hooks/use-call-appointment";

type CallSidebarTab = "chat" | "patient" | "notes" | "ai";

type CallSidebarProps = {
  appointmentId: string;
  currentUserName: string;
  messages: JitsiChatMessage[];
  activeTab: CallSidebarTab;
  canManageConsultation: boolean;
  onTabChangeAction: (tab: CallSidebarTab) => void;
  onSendMessageAction: (message: string) => void;
};

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

const formatMessageTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

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

const buildInsights = (params: {
  bloodPressure?: number;
  heartRate?: number;
  oxygenSaturation?: number;
  temperature?: number;
  motive?: string;
}) => {
  const insights: string[] = [];

  if ((params.bloodPressure ?? 0) >= 140) {
    insights.push(
      "La presión arterial está elevada; conviene confirmar medición y revisar antecedentes cardiovasculares.",
    );
  }

  if ((params.heartRate ?? 0) > 100) {
    insights.push("La frecuencia cardíaca está por encima del rango habitual en reposo.");
  }

  if ((params.oxygenSaturation ?? 100) < 94) {
    insights.push("La saturación de oxígeno sugiere vigilancia respiratoria más estrecha.");
  }

  if ((params.temperature ?? 0) >= 37.8) {
    insights.push("Hay temperatura elevada; considerar correlacionar con síntomas infecciosos o inflamatorios.");
  }

  if (params.motive) {
    insights.push(`Motivo principal registrado: ${params.motive}.`);
  }

  if (insights.length === 0) {
    insights.push(
      "Los signos vitales cargados no muestran alertas obvias. Continúa con anamnesis y exploración dirigida.",
    );
  }

  return insights;
};

export const CallSidebar = ({
  appointmentId,
  currentUserName,
  messages,
  activeTab,
  canManageConsultation,
  onTabChangeAction,
  onSendMessageAction,
}: CallSidebarProps) => {
  const { appointment, patient, isLoading, addNote, removeNote, updateStatus, addVitals } =
    useCallAppointment(appointmentId);
  const [draft, setDraft] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(appointment?.status ?? "SCHEDULED");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (appointment?.status) {
      setSelectedStatus(appointment.status);
    }
  }, [appointment?.status]);

  useEffect(() => {
    if (activeTab !== "chat") return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [activeTab, messages]);

  const latestVitals = patient?.vitals?.[0];
  const aiInsights = useMemo(
    () =>
      buildInsights({
        bloodPressure: latestVitals?.blood_pressure,
        heartRate: latestVitals?.heart_rate,
        oxygenSaturation: latestVitals?.oxygen_saturation,
        temperature: latestVitals?.temperature,
        motive: appointment?.motive,
      }),
    [appointment?.motive, latestVitals],
  );

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

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSendMessageAction(trimmed);
    setDraft("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background no-scrollbar">
      <Tabs
        value={activeTab}
        onValueChange={(value) => onTabChangeAction(value as CallSidebarTab)}
        className="flex h-full min-h-0 flex-col gap-0"
      >
        <div className="border-b border-border/70 px-3 py-2">
          <TabsList
            variant="line"
            className="h-auto w-full justify-between gap-1 overflow-x-auto rounded-none p-0 no-scrollbar"
          >
            <TabsTrigger
              value="chat"
              className="h-9 flex-none rounded-md px-3 data-active:bg-muted data-active:after:opacity-0"
            >
              <MessageSquare className="size-4" />
              Chat
            </TabsTrigger>
            {canManageConsultation ? (
              <>
                <TabsTrigger
                  value="patient"
                  className="h-9 flex-none rounded-md px-3 data-active:bg-muted data-active:after:opacity-0"
                >
                  <UserRound className="size-4" />
                  Paciente
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="h-9 flex-none rounded-md px-3 data-active:bg-muted data-active:after:opacity-0"
                >
                  <FileText className="size-4" />
                  Notas
                </TabsTrigger>
                <TabsTrigger
                  value="ai"
                  className="h-9 flex-none rounded-md px-3 data-active:bg-muted data-active:after:opacity-0"
                >
                  <Bot className="size-4" />
                  AI
                </TabsTrigger>
              </>
            ) : null}
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex min-h-0 flex-1 flex-col">
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 p-4 text-sm text-muted-foreground">
                El chat está listo. Envía el primer mensaje de la llamada.
              </div>
            ) : (
              messages.map((message) => {
                const isMine = message.from === currentUserName;
                return (
                  <div key={message.id} className={cn("flex flex-col gap-1", isMine ? "items-end" : "items-start")}>
                    {!isMine ? (
                      <span className="px-1 text-[10px] font-medium text-muted-foreground">{message.from}</span>
                    ) : null}
                    <div
                      className={cn(
                        "max-w-[88%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                        isMine
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm bg-muted text-foreground",
                      )}
                    >
                      {message.message}
                    </div>
                    <span className="px-1 text-[10px] text-muted-foreground">
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <form onSubmit={handleSend} className="border-t border-border/70 p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/35 p-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <Button type="submit" size="icon" disabled={!draft.trim()}>
                <Send className="size-4" />
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="patient" className="min-h-0 flex-1">
          <ScrollArea className="h-full px-4 py-4">
            <div className="space-y-4 pb-4">
              <Card className="border border-border/70 bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserRound className="size-4 text-primary" />
                    Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      Cargando datos clínicos...
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Nombre</p>
                          <p className="mt-1 font-medium text-foreground">{patient?.name ?? "Sin nombre"}</p>
                        </div>
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Edad</p>
                          <p className="mt-1 font-medium text-foreground">{calculateAge(patient?.birth_date)}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          Estado de la cita
                        </p>
                        <div className="flex gap-2">
                          <Select
                            value={selectedStatus}
                            onValueChange={(value) => setSelectedStatus(value ?? "SCHEDULED")}
                          >
                            <SelectTrigger>
                              {statusOptions.find((option) => option.value === selectedStatus)?.label ??
                                "Seleccionar estado"}
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
                            variant="outline"
                            onClick={() => updateStatus.mutate(selectedStatus)}
                            disabled={updateStatus.isPending}
                          >
                            {updateStatus.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                            Guardar
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Alergias</p>
                        <div className="flex flex-wrap gap-2">
                          {patient?.allergies?.length ? (
                            patient.allergies.map((allergy) => (
                              <Badge
                                key={allergy.id}
                                variant="outline"
                                className="rounded-full border-primary/20 text-primary"
                              >
                                {allergy.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">Sin alergias registradas</span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-border/70 bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HeartPulse className="size-4 text-primary" />
                    Signos vitales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Presión</p>
                      <p className="mt-1 font-medium text-foreground">
                        {latestVitals?.blood_pressure ? `${latestVitals.blood_pressure} mmHg` : "-"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Pulso</p>
                      <p className="mt-1 font-medium text-foreground">
                        {latestVitals?.heart_rate ? `${latestVitals.heart_rate} bpm` : "-"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">SpO₂</p>
                      <p className="mt-1 font-medium text-foreground">
                        {latestVitals?.oxygen_saturation ? `${latestVitals.oxygen_saturation}%` : "-"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Temp</p>
                      <p className="mt-1 font-medium text-foreground">
                        {latestVitals?.temperature ? `${latestVitals.temperature} °C` : "-"}
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      vitalsForm.handleSubmit();
                    }}
                    className="space-y-3 rounded-2xl border border-border/70 bg-muted/30 p-3"
                  >
                    <FieldGroup className="grid grid-cols-2 gap-2">
                      <vitalsForm.Field name="bloodPressure">
                        {(field) => (
                          <Field>
                            <FieldLabel htmlFor={field.name}>Presión</FieldLabel>
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
                            <FieldLabel htmlFor={field.name}>Pulso</FieldLabel>
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
                      <vitalsForm.Field name="oxygenSaturation">
                        {(field) => (
                          <Field>
                            <FieldLabel htmlFor={field.name}>SpO₂</FieldLabel>
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
                          <Field>
                            <FieldLabel htmlFor={field.name}>Temp</FieldLabel>
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
                    <Button type="submit" className="w-full" disabled={addVitals.isPending}>
                      {addVitals.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                      Guardar signos vitales
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="notes" className="min-h-0 flex-1">
          <ScrollArea className="h-full px-4 py-4">
            <div className="space-y-4 pb-4">
              <Card className="border border-border/70 bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="size-4 text-primary" />
                    Notas clínicas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      noteForm.handleSubmit();
                    }}
                    className="space-y-3"
                  >
                    <FieldGroup>
                      <noteForm.Field name="note">
                        {(field) => (
                          <Field>
                            <FieldLabel htmlFor={field.name}>Nueva nota</FieldLabel>
                            <Textarea
                              id={field.name}
                              rows={5}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              placeholder="Hallazgos, plan, observaciones o seguimiento..."
                            />
                          </Field>
                        )}
                      </noteForm.Field>
                    </FieldGroup>
                    <Button type="submit" className="w-full" disabled={addNote.isPending}>
                      {addNote.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                      Guardar nota
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {appointment?.notes?.length ? (
                  appointment.notes.map((note) => (
                    <Card key={note.id} className="border border-border/70 bg-card shadow-sm">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm text-foreground">{note.note}</p>
                            <p className="mt-2 text-[11px] text-muted-foreground">
                              {format(new Date(note.created_at), "PPPp", { locale: es })}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeNote.mutate(note.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
                    No hay notas registradas todavía.
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="ai" className="min-h-0 flex-1">
          <ScrollArea className="h-full px-4 py-4">
            <div className="space-y-4 pb-4">
              <Card className="border border-primary/15 bg-primary/5 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Sparkles className="size-4" />
                    Asistente clínico
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-foreground">
                  {aiInsights.map((insight, index) => (
                    <div key={index} className="rounded-2xl border border-primary/15 bg-background/80 p-3">
                      <p>{insight}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

