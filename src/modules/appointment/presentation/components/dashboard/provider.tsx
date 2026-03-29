"use client";
import { Appointment } from "@/modules/appointment/domain/appointment";
import { Primitives } from "@/modules/shared/domain/primitives";
import { PaginatedResult } from "@/modules/shared/domain/query";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, formatISO, startOfDay } from "date-fns";
import { parseAsString, useQueryState } from "nuqs";
import { createContext, useContext } from "react";

type AppointmentsContextType = {
  appointments: Primitives<Appointment>[];
  dayStats: Primitives<Appointment>[];
  isFetching: boolean;
  isFetchingStats: boolean;
};

const AppointmentsContext = createContext<AppointmentsContextType>({
  appointments: [],
  isFetching: false,
  dayStats: [],
  isFetchingStats: false,
});
export const AppointmentsProvider = ({ children }: { children: React.ReactNode }) => {
  const [date] = useQueryState("date", parseAsString);
  const [state] = useQueryState("status", parseAsString);
  const [type] = useQueryState("type", parseAsString);
  const { data, isFetching } = useQuery<Primitives<Appointment>[]>({
    queryKey: ["appointments", date, state, type],
    initialData: [],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const dateFilter = date ? new Date(date) : new Date();
      const date_from = startOfDay(dateFilter);
      const date_to = endOfDay(dateFilter);
      const params = new URLSearchParams();
      if (state && state !== "ALL") params.append("state", state);
      if (type && type !== "ALL") params.append("type", type);
      const url = `/api/appointment?startDate=${formatISO(date_from)}&endDate=${formatISO(date_to)}&${params.toString()}`;
      const response = await fetch(url);
      const data: PaginatedResult<Primitives<Appointment>> = await response.json();
      return data.data;
    },
  });

  const { data: dayStats, isFetching: isFetchingStats } = useQuery<Primitives<Appointment>[]>({
    queryKey: ["appointment-stats", date],
    initialData: [],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const dateFilter = date ? new Date(date) : new Date();
      const date_from = startOfDay(dateFilter);
      const date_to = endOfDay(dateFilter);
      const url = `/api/appointment?startDate=${formatISO(date_from)}&endDate=${formatISO(date_to)}`;
      const response = await fetch(url);
      const data: PaginatedResult<Primitives<Appointment>> = await response.json();
      return data.data;
    },
  });

  return (
    <AppointmentsContext.Provider value={{ appointments: data, isFetching, dayStats, isFetchingStats }}>
      {children}
    </AppointmentsContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentsContext);
  if (!context) {
    throw new Error("useAppointments must be used within an AppointmentsProvider");
  }
  return context;
};

