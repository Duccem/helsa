"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { endOfMonth, format, isSameDay, startOfMonth } from "date-fns";
import { CalendarIcon, Clock3Icon, FilterIcon, UserRoundIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/modules/shared/presentation/components/ui/badge";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { Calendar } from "@/modules/shared/presentation/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/shared/presentation/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/modules/shared/presentation/components/ui/drawer";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/modules/shared/presentation/components/ui/empty";
import { Input } from "@/modules/shared/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/presentation/components/ui/select";
import {
  ServerPagination,
  ServerTable,
  SortableHeader,
} from "@/modules/shared/presentation/components/ui/server-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/modules/shared/presentation/components/ui/tabs";
import { AppointmentsFilter } from "./filter/appointment-filter";

type AppointmentState =
  | "SCHEDULED"
  | "CONFIRMED"
  | "PAYED"
  | "READY"
  | "STARTED"
  | "CANCELLED"
  | "MISSED_BY_PATIENT"
  | "MISSED_BY_THERAPIST"
  | "FINISHED";

type AppointmentMode = "ONLINE" | "IN_PERSON";
type AppointmentType = "THERAPY" | "INITIAL";

type AppointmentListItem = {
  id: string;
  organization_id: string | null;
  patient_id: string;
  patient_name: string | null;
  doctor_id: string;
  doctor_name: string | null;
  date: string;
  motive: string;
  type: AppointmentType;
  mode: AppointmentMode;
  status: AppointmentState;
  created_at: string;
  updated_at: string;
};

type AppointmentDetails = {
  id: string;
  organization_id: string | null;
  patient_id: string;
  doctor_id: string;
  date: string;
  motive: string;
  type: AppointmentType;
  mode: AppointmentMode;
  status: AppointmentState;
  created_at: string;
  updated_at: string;
  rating?: {
    id: string;
    appointment_id: string;
    patient_id: string;
    doctor_id: string;
    score: number;
    created_at: string;
    updated_at: string;
  };
  notes?: Array<{
    id: string;
    note: string;
    created_at: string;
    updated_at: string;
  }>;
};

type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    nextPage: number | null;
    prevPage: number | null;
  };
};

const STATUS_OPTIONS: AppointmentState[] = [
  "SCHEDULED",
  "CONFIRMED",
  "PAYED",
  "READY",
  "STARTED",
  "CANCELLED",
  "MISSED_BY_PATIENT",
  "MISSED_BY_THERAPIST",
  "FINISHED",
];

const VIEW_OPTIONS = ["table", "calendar", "timeline"] as const;

type ViewOption = (typeof VIEW_OPTIONS)[number];

function toStatusLabel(status: AppointmentState) {
  return status.toLowerCase().replaceAll("_", " ");
}

function toTypeLabel(type: AppointmentType) {
  return type === "INITIAL" ? "Initial" : "Therapy";
}

function toModeLabel(mode: AppointmentMode) {
  return mode === "ONLINE" ? "Online" : "In person";
}

function toStatusVariant(status: AppointmentState): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "FINISHED":
      return "default";
    case "CANCELLED":
    case "MISSED_BY_PATIENT":
    case "MISSED_BY_THERAPIST":
      return "destructive";
    case "READY":
    case "STARTED":
    case "PAYED":
      return "secondary";
    default:
      return "outline";
  }
}

async function fetchAppointments(queryString: string): Promise<PaginatedResult<AppointmentListItem>> {
  const response = await fetch(`/api/appointment?${queryString}`);

  if (!response.ok) {
    throw new Error("Unable to load appointments");
  }

  return (await response.json()) as PaginatedResult<AppointmentListItem>;
}

async function fetchAppointmentDetails(appointmentId: string): Promise<AppointmentDetails> {
  const response = await fetch(`/api/appointment/${appointmentId}`);

  if (!response.ok) {
    throw new Error("Unable to load appointment details");
  }

  return (await response.json()) as AppointmentDetails;
}

export function AppointmentsDashboard() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const activeView = (searchParams.get("view") as ViewOption) ?? "table";
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");

  const filters = {
    state: searchParams.get("state") ?? "",
    type: searchParams.get("type") ?? "",
    mode: searchParams.get("mode") ?? "",
    startDate: searchParams.get("startDate") ?? "",
    endDate: searchParams.get("endDate") ?? "",
    sort: searchParams.get("sort") ?? "date",
    order: searchParams.get("order") ?? "ASC",
  };

  const setSearchParams = (updates: Record<string, string | null>, resetPage = false) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        params.delete(key);
        continue;
      }

      params.set(key, value);
    }

    if (resetPage) {
      params.set("page", "1");
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const sharedQueryString = useMemo(() => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    if (filters.state) {
      params.set("state", filters.state);
    }

    if (filters.type) {
      params.set("type", filters.type);
    }

    if (filters.mode) {
      params.set("mode", filters.mode);
    }

    if (filters.startDate) {
      params.set("startDate", filters.startDate);
    }

    if (filters.endDate) {
      params.set("endDate", filters.endDate);
    }

    params.set("sort", filters.sort);
    params.set("order", filters.order);

    return params.toString();
  }, [
    filters.endDate,
    filters.mode,
    filters.order,
    filters.sort,
    filters.startDate,
    filters.state,
    filters.type,
    page,
    pageSize,
  ]);

  const calendarQueryString = useMemo(() => {
    const params = new URLSearchParams();

    params.set("page", "1");
    params.set("pageSize", "100");
    params.set("startDate", startOfMonth(currentMonth).toISOString());
    params.set("endDate", endOfMonth(currentMonth).toISOString());
    params.set("sort", "date");
    params.set("order", "ASC");

    if (filters.state) {
      params.set("state", filters.state);
    }

    if (filters.type) {
      params.set("type", filters.type);
    }

    if (filters.mode) {
      params.set("mode", filters.mode);
    }

    return params.toString();
  }, [currentMonth, filters.mode, filters.state, filters.type]);

  const appointmentsQuery = useQuery({
    queryKey: ["appointments", sharedQueryString],
    queryFn: async () => await fetchAppointments(sharedQueryString),
  });

  const calendarQuery = useQuery({
    queryKey: ["appointments-calendar", calendarQueryString],
    queryFn: async () => await fetchAppointments(calendarQueryString),
  });

  const detailsQuery = useQuery({
    queryKey: ["appointment-details", selectedAppointmentId],
    enabled: isDetailsOpen && Boolean(selectedAppointmentId),
    queryFn: async () => await fetchAppointmentDetails(selectedAppointmentId as string),
  });

  const openDetails = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setIsDetailsOpen(true);
  };

  const calendarAppointments = calendarQuery.data?.data ?? [];

  const selectedDayAppointments = useMemo(
    () =>
      calendarAppointments
        .filter((appointment) => isSameDay(new Date(appointment.date), selectedDate))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [calendarAppointments, selectedDate],
  );

  const highlightedDays = useMemo(
    () => calendarAppointments.map((appointment) => new Date(appointment.date)),
    [calendarAppointments],
  );

  const timelineByDay = useMemo(() => {
    const entries = appointmentsQuery.data?.data ?? [];
    const groups = new Map<string, AppointmentListItem[]>();

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
  }, [appointmentsQuery.data?.data]);

  const columns: Array<ColumnDef<AppointmentListItem>> = [
    {
      accessorKey: "date",
      header: ({ table }) => (
        <SortableHeader table={table} name="date">
          Date
        </SortableHeader>
      ),
      cell: ({ row }) => format(new Date(row.original.date), "MMM d, yyyy HH:mm"),
    },
    {
      accessorKey: "patient_name",
      header: "Patient",
      cell: ({ row }) => row.original.patient_name ?? row.original.patient_id,
    },
    {
      accessorKey: "doctor_name",
      header: "Doctor",
      cell: ({ row }) => row.original.doctor_name ?? row.original.doctor_id,
    },
    {
      accessorKey: "status",
      header: ({ table }) => (
        <SortableHeader table={table} name="status">
          Status
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <Badge variant={toStatusVariant(row.original.status)}>{toStatusLabel(row.original.status)}</Badge>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => toTypeLabel(row.original.type),
    },
    {
      accessorKey: "mode",
      header: "Mode",
      cell: ({ row }) => toModeLabel(row.original.mode),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => openDetails(row.original.id)}>
          View details
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: appointmentsQuery.data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = Math.max(
    1,
    Math.ceil(
      (appointmentsQuery.data?.pagination.total ?? 0) / (appointmentsQuery.data?.pagination.pageSize ?? pageSize),
    ),
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      <AppointmentsFilter />

      <Tabs
        value={activeView}
        onValueChange={(value) => setSearchParams({ view: value as ViewOption })}
        className="w-full"
      >
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <ServerTable table={table} columns={columns} />
            </CardContent>
          </Card>

          <Card>
            <ServerPagination
              meta={{
                page: appointmentsQuery.data?.pagination.page ?? page,
                pages: totalPages,
                pageSize: appointmentsQuery.data?.pagination.pageSize ?? pageSize,
                total: appointmentsQuery.data?.pagination.total ?? 0,
              }}
            />
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
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
                  const dayAppointments = calendarAppointments
                    .filter((appointment) => isSameDay(new Date(appointment.date), day))
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                  if (dayAppointments[0]) {
                    openDetails(dayAppointments[0].id);
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
                          <p className="text-muted-foreground">{appointment.patient_name ?? appointment.patient_id}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => openDetails(appointment.id)}>
                          Open details
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          {timelineByDay.length === 0 ? (
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
            </Card>
          ) : (
            timelineByDay.map((group) => (
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
                          {appointment.patient_name ?? appointment.patient_id}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => openDetails(appointment.id)}>
                        Details
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Drawer open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Appointment details</DrawerTitle>
            <DrawerDescription>
              {detailsQuery.data
                ? format(new Date(detailsQuery.data.date), "MMMM d, yyyy 'at' HH:mm")
                : "Loading details..."}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4 space-y-3">
            {detailsQuery.isPending && <p className="text-muted-foreground">Loading...</p>}
            {detailsQuery.isError && <p className="text-destructive">Unable to load appointment details.</p>}

            {detailsQuery.data && (
              <>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Patient</p>
                    <p>{detailsQuery.data.patient_id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Doctor</p>
                    <p>{detailsQuery.data.doctor_id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant={toStatusVariant(detailsQuery.data.status)}>
                      {toStatusLabel(detailsQuery.data.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mode</p>
                    <p>{toModeLabel(detailsQuery.data.mode)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground mb-1">Motive</p>
                  <p>{detailsQuery.data.motive}</p>
                </div>

                <div>
                  <p className="text-muted-foreground mb-1">Notes</p>
                  {detailsQuery.data.notes?.length ? (
                    <div className="space-y-1">
                      {detailsQuery.data.notes.map((note) => (
                        <p key={note.id} className="rounded-md border p-2">
                          {note.note}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No notes yet.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

