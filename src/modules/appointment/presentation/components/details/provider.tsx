"use client";

import { Appointment } from "@/modules/appointment/domain/appointment";
import { Primitives } from "@/modules/shared/domain/primitives";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { createContext, useContext } from "react";

type AppointmentDetailContextType = {
  appointment: Primitives<Appointment> | null;
  isFetching: boolean;
};

const AppointmentDetailContext = createContext<AppointmentDetailContextType | null>(null);

export const AppointmentDetailProvider = ({ children }: { children: React.ReactNode }) => {
  const { id } = useParams<{ id: string }>();

  const { data, isFetching } = useQuery<Primitives<Appointment>>({
    queryKey: ["appointment", id],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await fetch(`/api/appointment/${id}`);
      return response.json();
    },
  });

  return (
    <AppointmentDetailContext.Provider value={{ appointment: data ?? null, isFetching }}>
      {children}
    </AppointmentDetailContext.Provider>
  );
};

export const useAppointmentDetail = () => {
  const context = useContext(AppointmentDetailContext);
  if (!context) {
    throw new Error("useAppointmentDetail must be used within an AppointmentDetailProvider");
  }
  return context;
};
