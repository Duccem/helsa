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
  isFetching: boolean;
};

const AppointmentsContext = createContext<AppointmentsContextType>({ appointments: [], isFetching: false });
export const AppointmentsProvider = ({ children }: { children: React.ReactNode }) => {
  const [date] = useQueryState("date", parseAsString);
  const { data, isFetching } = useQuery<Primitives<Appointment>[]>({
    queryKey: ["appointments", date],
    initialData: [],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const dateFilter = date ? new Date(date) : new Date();
      const date_from = startOfDay(dateFilter);
      const date_to = endOfDay(dateFilter);
      const response = await fetch(`/api/appointment?startDate=${formatISO(date_from)}&endDate=${formatISO(date_to)}`);
      const data: PaginatedResult<Primitives<Appointment>> = await response.json();
      return data.data;
    },
  });

  return (
    <AppointmentsContext.Provider value={{ appointments: data, isFetching }}>{children}</AppointmentsContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentsContext);
  if (!context) {
    throw new Error("useAppointments must be used within an AppointmentsProvider");
  }
  return context;
};

