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
import { MapPin, MoreHorizontal, User, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppointments } from "./provider";
import { Primitives } from "@/modules/shared/domain/primitives";
import { Appointment } from "@/modules/appointment/domain/appointment";
import { format } from "date-fns";

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

export const AppointmentList = () => {
  const { appointments } = useAppointments();
  return (
    <ScrollArea className={"h-[500px] pr-6 pb-2"}>
      <div className="flex flex-col gap-4">
        {appointments.map((appointment, index) => (
          <AppointmentListItem key={appointment.id} appointment={appointment} index={index} />
        ))}
      </div>
    </ScrollArea>
  );
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
      className={cn(" transition-all hover:bg-accent/60  animate-fade-in border", {
        "bg-primary hover:bg-primary/60": appointment.status === "STARTED",
      })}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Time Block */}
          <div className="flex-shrink-0 text-center min-w-[70px]">
            <p className="text-sm font-bold">{format(appointment.date, "hh:mm")}</p>
          </div>

          {/* Divider */}
          <div className="w-px self-stretch bg-border" />

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={cn("flex h-8 w-8 items-center justify-center rounded-full bg-primary/10", {
                    "bg-indigo-500": appointment.status === "STARTED",
                  })}
                >
                  <User
                    className={cn("h-4 w-4 text-primary", {
                      "text-white": appointment.status === "STARTED",
                    })}
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm">{"Name"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn({
                    "border-green-500/50 text-green-500": appointment.status === "CONFIRMED",
                    "border-yellow-500/50 text-yellow-500": appointment.status === "STARTED",
                    "border-red-500/50 text-red-500": appointment.status === "CANCELLED",
                    "border-gray-500/50 text-gray-500": appointment.status === "SCHEDULED",
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

            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                {appointment.mode === "ONLINE" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                {appointment.mode === "ONLINE" ? "Video Call" : "In Person"}
              </span>
              <span>•</span>
              <span>{appointment.type}</span>
              <span>•</span>
              <span>{appointment.motive}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

