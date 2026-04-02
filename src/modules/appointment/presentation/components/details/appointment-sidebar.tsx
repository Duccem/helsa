"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/modules/shared/presentation/components/ui/avatar";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/modules/shared/presentation/components/ui/card";
import { Separator } from "@/modules/shared/presentation/components/ui/separator";
import {
  Calendar,
  Clock,
  Droplets,
  FileText,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Stethoscope,
} from "lucide-react";

// -- Patient Information --

interface PatientInfoProps {
  name: string;
  gender: string;
  age: number;
  dateOfBirth: string;
  phone: string;
  email: string;
  bloodType: string;
  photoUrl?: string;
}

export function PatientInfoCard({
  name,
  gender,
  age,
  dateOfBirth,
  phone,
  email,
  bloodType,
  photoUrl,
}: PatientInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Information</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarImage src={photoUrl} alt={name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">
              {gender} · {age} yrs · DOB: {dateOfBirth}
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="size-4 text-muted-foreground" />
            <span>{phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="size-4 text-muted-foreground" />
            <span>{email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Droplets className="size-4 text-muted-foreground" />
            <span>Blood Type: {bloodType}</span>
          </div>
        </div>

        <Button variant="outline" className="w-full">
          View Full Patient Record
        </Button>
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

export function AppointmentDetailsCard({
  date,
  time,
  mode,
  type,
}: AppointmentDetailsCardProps) {
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
          <Button
            key={action.label}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <Sparkles className="size-3 text-purple-500" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
