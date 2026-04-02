"use client";

import { Patient } from "@/modules/patient/domain/patient";
import { Primitives } from "@/modules/shared/domain/primitives";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/presentation/components/ui/avatar";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/presentation/components/ui/card";
import { Separator } from "@/modules/shared/presentation/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Clock, Droplets, FileText, Mail, MapPin, Phone, Sparkles, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useAppointmentDetail } from "./provider";

export function PatientInfoCard() {
  const calculateAge = (birth: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const { patient, isPendingPatient } = useAppointmentDetail();
  if (isPendingPatient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Informacion del paciente</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">Cargando...</CardContent>
      </Card>
    );
  }

  if (!patient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Informacion del paciente</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">Informacion del paciente no encontrada.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informacion del paciente</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {patient.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{patient.name}</p>
            <p className="text-xs text-muted-foreground">
              {patient.gender === "MAN" ? "Hombre" : patient.gender == "WOMAN" ? "Mujer" : "Otro"} ·
              {calculateAge(new Date(patient.birth_date))} años · Nacimiento:{" "}
              {format(new Date(patient.birth_date), "MM/dd/yyyy")}
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="size-4 text-muted-foreground" />
            <span>{patient.contact_info?.[0]?.phone ?? "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="size-4 text-muted-foreground" />
            <span>{patient.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Droplets className="size-4 text-muted-foreground" />
            <span>Tipo de sangre: {patient.physical_information?.blood_type}</span>
          </div>
        </div>

        <Link href={`/patients/${patient.id}`}>
          <Button variant="outline" className="w-full">
            Ver perfil del paciente
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

const modeLabels: Record<string, string> = {
  ONLINE: "Online",
  IN_PERSON: "Presencial",
};

const typeLabels: Record<string, string> = {
  CONSULTATION: "Consulta",
  FOLLOW_UP: "Seguimiento",
  CHECK_UP: "Chequeo",
  EMERGENCY: "Emergencia",
  PROCEDURE: "Procedimiento",
};

export function AppointmentDetailsCard() {
  const { appointment, isPendingAppointment } = useAppointmentDetail();

  if (isPendingAppointment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detalles de la cita</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">Loading...</CardContent>
      </Card>
    );
  }

  if (!appointment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detalles de la cita</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">No appointment data found.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles de la cita</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="size-4" />
            <span>Fecha</span>
          </div>
          <span className="font-medium">{format(new Date(appointment?.date ?? new Date()), "MMMM d, yyyy")}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4" />
            <span>Hora</span>
          </div>
          <span className="font-medium">{format(new Date(`1970-01-01T${appointment?.hour}`), "hh:mm a")}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4" />
            <span>Modalidad</span>
          </div>
          <span className="font-medium">{modeLabels[appointment?.mode ?? ""]}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Stethoscope className="size-4" />
            <span>Tipo</span>
          </div>
          <span className="font-medium">{typeLabels[appointment?.type ?? ""]}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// -- AI Actions --

interface AiAction {
  label: string;
}

interface AiActionsCardProps {
  actions: AiAction[];
}

export function AiActionsCard({ actions }: AiActionsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-purple-500" />
          AI Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {actions.map((action) => (
          <Button key={action.label} variant="outline" className="w-full justify-start gap-2">
            <Sparkles className="size-3 text-purple-500" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

