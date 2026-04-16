"use client";

import { cn } from "@/modules/shared/presentation/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ReactNode } from "react";

export type Pagination = {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
};

export type AppointmentPatient = {
  name?: string;
  email?: string;
  photo_url?: string;
};

export type Appointment = {
  id?: string;
  date?: string | Date;
  hour?: string;
  motive?: string;
  type?: string;
  mode?: string;
  status?: string;
  patient?: AppointmentPatient;
  payment?: {
    amount?: number;
    status?: string;
  };
  notes?: Array<{ id?: string; content?: string; note?: string }>;
  rating?: {
    score?: number;
    comment?: string;
  };
};

export type Patient = {
  name?: string;
  email?: string;
  birth_date?: string | Date;
  gender?: string;
  contact_info?: Array<{ phone?: string; address?: string }>;
  physical_information?: {
    height?: number;
    weight?: number;
    body_mass_index?: number;
    blood_type?: string;
  };
  vitals?: Array<{
    blood_pressure?: number;
    heart_rate?: number;
    respiratory_rate?: number;
    oxygen_saturation?: number;
    temperature?: number;
  }>;
  allergies?: Array<{
    id?: string;
    name?: string;
    severity?: string;
    notes?: string;
  }>;
};

export type Diagnosis = {
  id?: string;
  summary?: string;
  cie_code?: string;
  state?: string;
  certainty?: string;
  income?: string;
  type?: string;
  created_at?: string | Date;
};

export type Medication = {
  id?: string;
  name?: string;
  dosage?: number;
  dosage_unit?: string;
  frequency?: string;
  administration_method?: string;
  notes?: string | null;
  state?: string;
};

export type Prescription = {
  id?: string;
  observation?: string;
  created_at?: string | Date;
  medications?: Medication[];
};

export const appointmentStatusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  SCHEDULED: "Agendada",
  READY: "Lista",
  STARTED: "En curso",
  FINISHED: "Finalizada",
};

export const diagnosisStateLabels: Record<string, string> = {
  ACTIVE: "Activo",
  REMISSION: "Remisión",
  CURED: "Curado",
  RECURRENT: "Recurrente",
  DECEASED: "Fallecido",
};

export const diagnosisCertaintyLabels: Record<string, string> = {
  PRESUMPTIVE: "Presuntivo",
  DIFFERENTIAL: "Diferencial",
  DEFINITIVE: "Definitivo",
  DISCARD: "Descartado",
};

export const medicationStateLabels: Record<string, string> = {
  PENDING: "Pendiente",
  ACTIVE: "Activa",
  PAUSED: "Pausada",
  COMPLETED: "Completada",
};

export const allergySeverityLabels: Record<string, string> = {
  LOW: "Baja",
  MODERATE: "Moderada",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

export const diagnosisStateClasses: Record<string, string> = {
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REMISSION: "border-sky-200 bg-sky-50 text-sky-700",
  CURED: "border-teal-200 bg-teal-50 text-teal-700",
  RECURRENT: "border-amber-200 bg-amber-50 text-amber-700",
  DECEASED: "border-rose-200 bg-rose-50 text-rose-700",
};

export const appointmentStatusClasses: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  CONFIRMED: "border-sky-200 bg-sky-50 text-sky-700",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-rose-200 bg-rose-50 text-rose-700",
  SCHEDULED: "border-violet-200 bg-violet-50 text-violet-700",
  READY: "border-cyan-200 bg-cyan-50 text-cyan-700",
  STARTED: "border-blue-200 bg-blue-50 text-blue-700",
  FINISHED: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export const medicationStateClasses: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PAUSED: "border-slate-200 bg-slate-50 text-slate-700",
  COMPLETED: "border-sky-200 bg-sky-50 text-sky-700",
};

export const allergySeverityClasses: Record<string, string> = {
  LOW: "border-slate-200 bg-slate-50 text-slate-700",
  MODERATE: "border-amber-200 bg-amber-50 text-amber-700",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700",
  CRITICAL: "border-rose-200 bg-rose-50 text-rose-700",
};

export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

export const isPagination = (value: unknown): value is Pagination => {
  return isRecord(value);
};

export const getInitials = (value?: string) => {
  if (!value) return "--";

  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

export const toLabel = (value?: string, map?: Record<string, string>) => {
  if (!value) return "Sin dato";
  if (map?.[value]) return map[value];

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
};

export const formatDateValue = (value?: string | Date, pattern = "d MMM yyyy") => {
  if (!value) return "Sin fecha";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return format(date, pattern, { locale: es });
};

export const formatMoney = (value?: number) => {
  if (typeof value !== "number") return null;

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
};

export const MetricCard = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
};

export const PaginationSummary = ({ pagination }: { pagination?: Pagination }) => {
  if (!pagination || typeof pagination.total !== "number") {
    return null;
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-dashed border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
      <span>{pagination.total} resultados</span>
      <span>
        Página {pagination.page ?? 1}
        {typeof pagination.totalPages === "number" ? ` de ${pagination.totalPages}` : ""}
      </span>
    </div>
  );
};

export const badgeClassName = (base: string | undefined) => {
  return cn("rounded-full border", base);
};
