"use client";

import { Primitives } from "@/modules/shared/domain/primitives";
import { Appointment } from "../../domain/appointment";
import { useMemo } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/presentation/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/modules/shared/presentation/components/ui/empty";
import { Clock3Icon, UserRoundIcon } from "lucide-react";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import Link from "next/link";

type AppointmentsTimelineProps = {
  items: Primitives<Appointment>[];
};

export const AppointmentsTimeline = ({ items }: AppointmentsTimelineProps) => {
  const timelineByDay = useMemo(() => {
    const entries = items ?? [];
    const groups = new Map<string, Primitives<Appointment>[]>();

    for (const entry of entries) {
      const key = format(new Date(entry.date), "yyyy-MM-dd");
      const previous = groups.get(key) ?? [];
      groups.set(key, [...previous, entry]);
    }

    return [...groups.entries()]
      .sort(([left], [right]) => new Date(left).getTime() - new Date(right).getTime())
      .map(([day, items]) => ({
        day,
        items: items.sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()),
      }));
  }, [items]);

  if (timelineByDay.length === 0) {
    <Card>
      <CardContent className="pt-4">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Clock3Icon className="size-4" />
            </EmptyMedia>
            <EmptyTitle>No appointments found</EmptyTitle>
            <EmptyDescription>Adjust filters to see chronological appointments.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>;
  }

  return (
    <>
      {timelineByDay.map((group) => (
        <Card key={group.day}>
          <CardHeader>
            <CardTitle>{format(new Date(group.day), "EEEE, MMMM d")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {group.items.map((appointment) => (
              <div
                key={appointment.id}
                className="grid grid-cols-[64px_1fr_auto] items-center gap-3 rounded-lg border p-3"
              >
                <p className="font-medium">{format(new Date(appointment.date), "HH:mm")}</p>
                <div className="space-y-0.5">
                  <p className="font-medium">{appointment.motive}</p>
                  <p className="text-muted-foreground inline-flex items-center gap-1">
                    <UserRoundIcon className="size-3" />
                    {appointment.patient_id}
                  </p>
                </div>
                <Link href={`/appointments/${appointment.id}`}>
                  <Button size="sm" variant="ghost">
                    Details
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </>
  );
};

