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

// -- Patient Information --

interface PatientInfoProps {
  patientId: string;
}

export function PatientInfoCard({ patientId }: PatientInfoProps) {
  const calculateAge = (birth: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const { data, isPending } = useQuery<Primitives<Patient> | null>({
    queryKey: ["patient", "123"],
    initialData: null,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await fetch(`/api/patient/${patientId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch patient data");
      }
      return response.json();
    },
  });
  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">Loading...</CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">No patient data found.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Information</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {data.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{data.name}</p>
            <p className="text-xs text-muted-foreground">
              {calculateAge(new Date(data.birth_date))} yrs · DOB: {format(new Date(data.birth_date), "MM/dd/yyyy")}
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="size-4 text-muted-foreground" />
            <span>{data.contact_info?.[0]?.phone ?? "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="size-4 text-muted-foreground" />
            <span>{data.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Droplets className="size-4 text-muted-foreground" />
            <span>Blood Type: {data.physical_information?.blood_type}</span>
          </div>
        </div>

        <Link href={`/patients/${data.id}`}>
          <Button variant="outline" className="w-full">
            View Full Patient Record
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// -- Appointment Details --

interface AppointmentDetailsCardProps {
  date: string;
  time: string;
  mode: string;
  type: string;
}

export function AppointmentDetailsCard({ date, time, mode, type }: AppointmentDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Details</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="size-4" />
            <span>Date</span>
          </div>
          <span className="font-medium">{date}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4" />
            <span>Time</span>
          </div>
          <span className="font-medium">{time}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4" />
            <span>Mode</span>
          </div>
          <span className="font-medium">{mode}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Stethoscope className="size-4" />
            <span>Type</span>
          </div>
          <span className="font-medium">{type}</span>
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

