"use client";

import { Badge } from "@/modules/shared/presentation/components/ui/badge";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/modules/shared/presentation/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/modules/shared/presentation/components/ui/dropdown-menu";
import { ScrollArea } from "@/modules/shared/presentation/components/ui/scroll-area";
import { cn } from "@/modules/shared/presentation/lib/utils";
import { Clock, MapPin, MoreHorizontal, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppointments } from "./provider";
import { Primitives } from "@/modules/shared/domain/primitives";
import { Appointment } from "@/modules/appointment/domain/appointment";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/presentation/components/ui/avatar";

const mappingStatus = {
  SCHEDULED: "Agendada",
  IN_PROGRESS: "En curso",
  CANCELLED: "Cancelada",
  FINISHED: "Completada",
};

export const AppointmentList = () => {
  const { appointments, isFetching } = useAppointments();
  if (isFetching) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <AppointmentListItemSkeleton key={index} />
        ))}
      </div>
    );
  }
  return (
    <ScrollArea className={"h-[500px]  pb-2"}>
      <div className="flex flex-col gap-4">
        {appointments.map((appointment, index) => (
          <AppointmentListItem key={appointment.id} appointment={appointment} index={index} />
        ))}
      </div>
    </ScrollArea>
  );
};

const calculateAge = (dateOfBirth: Date) => {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDifference = today.getMonth() - dateOfBirth.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }

  return age;
};

const appointmentTypes = {
  CONSULTATION: "Consulta",
  FOLLOW_UP: "Seguimiento",
  CHECK_UP: "Chequeo",
  EMERGENCY: "Emergencia",
  PROCEDURE: "Procedimiento",
};

export const AppointmentListItem = ({
  appointment,
  index,
}: {
  appointment: Primitives<Appointment>;
  index: number;
}) => {
  const router = useRouter();
  return (
    <Card
      key={appointment.id}
      className={cn(" transition-all hover:bg-accent/60 border-none  animate-fade-in border", {
        "bg-primary hover:bg-primary/60": appointment.status === "IN_PROGRESS",
      })}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Time Block */}
          <div className="flex items-center gap-2 min-w-[75px] text-center">
            <Clock className="size-4" />
            <p className="text-sm font-bold">{format(new Date(`2000-01-01 ${appointment.hour}`), "p")}</p>
          </div>

          {/* Divider */}
          <div className="w-px self-stretch bg-border" />

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage
                    src={appointment.patient?.photo_url ?? ""}
                    alt={appointment.patient?.name ?? ""}
                    className="grayscale"
                  />
                  <AvatarFallback className={"bg-primary"}>
                    {appointment.patient?.name ? appointment.patient.name.at(0)?.toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{appointment.patient?.name ?? ""}</p>
                  <p className="text-xs text-muted-foreground">
                    {appointment.patient?.birth_date
                      ? `${calculateAge(new Date(appointment.patient.birth_date))} años`
                      : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(" rounded-full ", {
                    "bg-emerald-500/50 text-emerald-500": appointment.status === "IN_PROGRESS",
                    "border-red-500/50 text-red-500": appointment.status === "CANCELLED",
                    "border-indigo-500/50 text-indigo-500": appointment.status === "SCHEDULED",
                    "border-blue-500/50 text-blue-500": appointment.status === "FINISHED",
                  })}
                >
                  {mappingStatus[appointment.status as keyof typeof mappingStatus]}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/appointments/${appointment.id}`)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>Reschedule</DropdownMenuItem>
                    <DropdownMenuItem>Start Consultation</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  {appointment.mode === "ONLINE" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                  {appointment.mode === "ONLINE" ? "Online" : "Presencial"}
                </span>
                <span>•</span>
                <span>{appointmentTypes[appointment.type as keyof typeof appointmentTypes]}</span>
                <span>•</span>
                <span>{appointment.motive}</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-xs font-semibold">$ {appointment.payment?.amount.toFixed(2) ?? "0.00"}</span>
                <span>-</span>
                <span className="text-xs font-semibold">
                  {appointment.payment?.payment_mode === "PREPAID"
                    ? "Prepagado"
                    : appointment.payment?.payment_mode === "POSTPAID"
                      ? "Pospago"
                      : appointment.payment?.payment_mode === "CREDIT"
                        ? "Crédito"
                        : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const AppointmentListItemSkeleton = () => {
  return (
    <Card className="animate-pulse border-none">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Time Block */}
          <div className="flex-shrink-0 text-center min-w-[70px]">
            <div className="h-4 w-12 bg-muted rounded" />
          </div>

          {/* Divider */}
          <div className="w-px self-stretch bg-border" />

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback className={"bg-primary"}>?</AvatarFallback>
                </Avatar>
                <div>
                  <div className="h-4 w-20 bg-muted rounded mb-1" />
                  <div className="h-3 w-12 bg-muted rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full border-gray-500/50 text-gray-500">
                  Loading
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="h-3 w-16 bg-muted rounded" />
              <span>•</span>
              <div className="h-3 w-10 bg-muted rounded" />
              <span>•</span>
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

