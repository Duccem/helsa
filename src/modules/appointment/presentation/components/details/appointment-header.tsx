"use client";

import { Badge } from "@/modules/shared/presentation/components/ui/badge";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/modules/shared/presentation/components/ui/dropdown-menu";
import { cn } from "@/modules/shared/presentation/lib/utils";
import { ArrowLeft, MoreHorizontal, Printer, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";

const statusLabels = {
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  CANCELLED: "Cancelled",
  FINISHED: "Completed",
} as const;

const statusStyles = {
  SCHEDULED: "border-indigo-500/50 text-indigo-500",
  IN_PROGRESS: "bg-emerald-500/20 border-emerald-500/50 text-emerald-500",
  CANCELLED: "border-red-500/50 text-red-500",
  FINISHED: "bg-emerald-500/20 border-emerald-500/50 text-emerald-500",
} as const;

type AppointmentStatus = keyof typeof statusLabels;

interface AppointmentHeaderProps {
  patientName: string;
  status: AppointmentStatus;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
}

export function AppointmentHeader({
  patientName,
  status,
  date,
  startTime,
  endTime,
  type,
}: AppointmentHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-1"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{patientName}</h1>
            <Badge
              variant="outline"
              className={cn("rounded-full", statusStyles[status])}
            >
              {statusLabels[status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {date} · {startTime} – {endTime} · {type}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon">
          <Printer className="size-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Share2 className="size-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Reschedule</DropdownMenuItem>
            <DropdownMenuItem>Edit Appointment</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Cancel Appointment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
