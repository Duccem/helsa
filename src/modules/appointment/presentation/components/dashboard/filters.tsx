"use client";

import { Calendar } from "@/modules/shared/presentation/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/shared/presentation/components/ui/card";
import { Input } from "@/modules/shared/presentation/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/modules/shared/presentation/components/ui/select";
import { formatISO } from "date-fns";
import { CalendarDays, Filter, Search } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";

const mappingStatus = {
  SCHEDULED: "Agendada",
  CONFIRMED: "Confirmada",
  PAYED: "Pagada",
  READY: "Lista",
  STARTED: "En curso",
  CANCELLED: "Cancelada",
  MISSED_BY_PATIENT: "Retrasada por paciente",
  MISSED_BY_THERAPIST: "Retrasada por terapeuta",
  FINISHED: "Completada",
};

const appointmentTypes = {
  CONSULTATION: "Consulta",
  FOLLOW_UP: "Seguimiento",
  CHECK_UP: "Chequeo",
  EMERGENCY: "Emergencia",
  PROCEDURE: "Procedimiento",
};

export const AppointmentFilters = () => {
  const [status, setStatus] = useQueryState("status", parseAsString.withDefault("ALL"));
  const [type, setType] = useQueryState("type", parseAsString.withDefault("ALL"));
  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative w-full">
            <Search className="absolute size-4 left-2 top-2" />
            <Input className="w-full pl-8" placeholder="Busca por paciente o motivo" />
          </div>
          <Select onValueChange={(value) => setStatus(value)} defaultValue={status} value={status}>
            <SelectTrigger className={"w-[200px]"}>
              <Filter />
              {mappingStatus[status as keyof typeof mappingStatus] || "Todos los estados"}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"ALL"}>Todos los estados</SelectItem>
              {Object.entries(mappingStatus).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setType(value)} defaultValue={type} value={type}>
            <SelectTrigger className={"w-[200px]"}>
              <Filter />
              {type === "ALL" ? "Todos los tipos" : type === "INITIAL" ? "Inicial" : "Terapia"}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"ALL"}>Todos los tipos</SelectItem>
              {Object.entries(appointmentTypes).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export const AppointmentFilterCalendar = () => {
  const [date, setDate] = useQueryState("date", parseAsString);
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/25">
              <CalendarDays className="text-primary size-5" />
            </div>
            Filtrar por fecha
          </div>
        </CardTitle>
        <CardDescription>
          Estas viendo las citas de hoy. Cambia el rango de fechas para ver otras citas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl">
          <Calendar
            className="w-full"
            mode="single"
            selected={date ? new Date(date) : new Date()}
            onSelect={(selected) => {
              if (!selected) return;

              setDate(formatISO(selected));
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

