"use client";

import { Primitives } from "@/modules/shared/domain/primitives";
import { Appointment } from "../../domain/appointment";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/shared/presentation/components/ui/card";
import { CalendarIcon, Clock3Icon } from "lucide-react";
import { Calendar } from "@/modules/shared/presentation/components/ui/calendar";
import { format, isSameDay, startOfMonth } from "date-fns";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/modules/shared/presentation/components/ui/empty";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AppointmentsCalendarProps = {
  items: Primitives<Appointment>[];
};

export const AppointmentsCalendar = ({ items }: AppointmentsCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const router = useRouter();

  const selectedDayAppointments = useMemo(
    () =>
      items
        .filter((appointment) => isSameDay(new Date(appointment.date), selectedDate))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [items, selectedDate],
  );

  const highlightedDays = useMemo(() => items.map((appointment) => new Date(appointment.date)), [items]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="size-4" />
          Calendar
        </CardTitle>
        <CardDescription>
          Click any day with appointments to open the first appointment details automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        <Calendar
          mode="single"
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          selected={selectedDate}
          onDayClick={(day) => {
            setSelectedDate(day);
            const dayAppointments = items
              .filter((appointment) => isSameDay(new Date(appointment.date), day))
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            if (dayAppointments[0]) {
              router.push(`/appointments/${dayAppointments[0].id}`);
            }
          }}
          modifiers={{
            hasAppointment: highlightedDays,
          }}
          modifiersClassNames={{
            hasAppointment: "ring-1 ring-primary/50 bg-primary/5",
          }}
        />

        <div className="space-y-3">
          <h3 className="text-sm font-medium">{format(selectedDate, "MMMM d, yyyy")}</h3>
          {selectedDayAppointments.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Clock3Icon className="size-4" />
                </EmptyMedia>
                <EmptyTitle>No appointments</EmptyTitle>
                <EmptyDescription>There are no appointments for the selected day.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            selectedDayAppointments.map((appointment) => (
              <Card key={appointment.id} size="sm" className="ring-1 ring-border/60">
                <CardContent className="flex items-center justify-between gap-4 pt-3">
                  <div>
                    <p className="font-medium">{format(new Date(appointment.date), "HH:mm")}</p>
                    <p className="text-muted-foreground">{appointment.patient_id}</p>
                  </div>
                  <Link href={`/appointments/${appointment.id}`}>
                    <Button size="sm" variant="outline">
                      Open details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

