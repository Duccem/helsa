"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Clock3Icon, UserRoundIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/presentation/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/modules/shared/presentation/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/modules/shared/presentation/components/ui/tabs";
import { AppointmentsFilter } from "./filter/appointment-filter";
import { AppointmentsTable } from "./appointments-table";
import { AppointmentsCalendar } from "./appointments-calendar";
import { PaginatedResult } from "@/modules/shared/domain/query";
import { AppointmentsTimeline } from "./appointments-timeline";
import { parseAsInteger, parseAsString, useQueryState, useQueryStates } from "nuqs";
import { Primitives } from "@/modules/shared/domain/primitives";
import { Appointment } from "../../domain/appointment";
import { ServerTableLoading } from "@/modules/shared/presentation/components/ui/server-table";

const VIEW_OPTIONS = ["table", "calendar", "timeline"] as const;

type ViewOption = (typeof VIEW_OPTIONS)[number];

async function fetchAppointments(queryString: string): Promise<PaginatedResult<Primitives<Appointment>>> {
  const response = await fetch(`/api/appointment?${queryString}`);

  if (!response.ok) {
    throw new Error("Unable to load appointments");
  }

  return (await response.json()) as PaginatedResult<Primitives<Appointment>>;
}

export function AppointmentsDashboard() {
  const [activeView, setActiveView] = useQueryState("view", parseAsString.withDefault("table"));
  const [{ page, pageSize }] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(10),
  });
  const [{ order, sort }] = useQueryStates({
    sort: parseAsString.withDefault("date"),
    order: parseAsString.withDefault("ASC"),
  });
  const [{ end, start, mode, state, type }] = useQueryStates({
    state: parseAsString.withDefault(""),
    type: parseAsString.withDefault(""),
    mode: parseAsString.withDefault(""),
    start: parseAsString.withDefault(""),
    end: parseAsString.withDefault(""),
  });

  const sharedQueryString = useMemo(() => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    if (state) {
      params.set("state", state);
    }

    if (type) {
      params.set("type", type);
    }

    if (mode) {
      params.set("mode", mode);
    }

    if (start) {
      params.set("startDate", start);
    }

    if (end) {
      params.set("endDate", end);
    }

    params.set("sort", sort);
    params.set("order", order);

    return params.toString();
  }, [end, mode, order, sort, start, state, type, page, pageSize]);

  const { data, isPending, isError } = useQuery({
    queryKey: ["appointments", sharedQueryString],
    initialData: { data: [], pagination: { page: 1, pageSize: 20, total: 0, nextPage: null, prevPage: null } },
    queryFn: async () => await fetchAppointments(sharedQueryString),
  });

  if (isPending) {
    return (
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as ViewOption)} className="w-full">
        <TabsContent value="table" className="space-y-4">
          <ServerTableLoading cellNumber={7} />
        </TabsContent>
        <TabsContent value="calendar" className="space-y-4">
          <ServerTableLoading cellNumber={7} />
        </TabsContent>
        <TabsContent value="timeline" className="space-y-4">
          <ServerTableLoading cellNumber={7} />
        </TabsContent>
      </Tabs>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-4">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Clock3Icon className="size-4" />
              </EmptyMedia>
              <EmptyTitle>Unable to load appointments</EmptyTitle>
              <EmptyDescription>Try adjusting your filters or check your connection.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs value={activeView} onValueChange={(value) => setActiveView(value as ViewOption)} className="w-full">
      <TabsContent value="table" className="space-y-4">
        <AppointmentsTable items={data.data} pagination={data.pagination} />
      </TabsContent>

      <TabsContent value="calendar" className="space-y-4">
        <AppointmentsCalendar items={data.data} />
      </TabsContent>

      <TabsContent value="timeline" className="space-y-4">
        <AppointmentsTimeline items={data.data} />
      </TabsContent>
    </Tabs>
  );
}

