"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Appointment } from "@/modules/appointment/domain/appointment";
import type { Patient } from "@/modules/patient/domain/patient";
import type { Primitives } from "@/modules/shared/domain/primitives";

export function useCallAppointment(appointmentId: string) {
  const queryClient = useQueryClient();

  const { data: appointment, isFetching: isFetchingAppointment } = useQuery<Primitives<Appointment> | null>({
    queryKey: ["appointment", appointmentId],
    refetchOnWindowFocus: false,
    enabled: !!appointmentId,
    initialData: null,
    queryFn: async () => {
      const response = await fetch(`/api/appointment/${appointmentId}`);
      if (!response.ok) return null;
      return response.json();
    },
  });

  const { data: patient, isFetching: isFetchingPatient } = useQuery<Primitives<Patient> | null>({
    queryKey: ["patient", appointment?.patient_id],
    refetchOnWindowFocus: false,
    enabled: !!appointment?.patient_id,
    initialData: null,
    queryFn: async () => {
      const response = await fetch(`/api/patient/${appointment?.patient_id}`);
      if (!response.ok) return null;
      return response.json();
    },
  });

  const addNote = useMutation({
    mutationFn: async (note: string) => {
      const response = await fetch(`/api/appointment/${appointmentId}/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (!response.ok) throw new Error("Error al guardar la nota");
    },
    onSuccess: () => {
      toast.success("Nota agregada");
      queryClient.invalidateQueries({
        queryKey: ["appointment", appointmentId],
      });
    },
    onError: () => toast.error("Error al agregar la nota"),
  });

  const removeNote = useMutation({
    mutationFn: async (noteId: string) => {
      const response = await fetch(`/api/appointment/${appointmentId}/note`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });
      if (!response.ok) throw new Error("Error al eliminar la nota");
    },
    onSuccess: () => {
      toast.success("Nota eliminada");
      queryClient.invalidateQueries({
        queryKey: ["appointment", appointmentId],
      });
    },
    onError: () => toast.error("Error al eliminar la nota"),
  });

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`/api/appointment/${appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Error al actualizar el estado");
    },
    onSuccess: () => {
      toast.success("Estado actualizado");
      queryClient.invalidateQueries({
        queryKey: ["appointment", appointmentId],
      });
    },
    onError: () => toast.error("Error al actualizar el estado"),
  });

  const addVitals = useMutation({
    mutationFn: async (vitals: {
      bloodPressure?: number;
      heartRate?: number;
      respiratoryRate?: number;
      oxygenSaturation?: number;
      temperature?: number;
    }) => {
      const response = await fetch(`/api/patient/${appointment?.patient_id}/vitals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vitals),
      });
      if (!response.ok) throw new Error("Error al registrar signos vitales");
    },
    onSuccess: () => {
      toast.success("Signos vitales registrados");
      queryClient.invalidateQueries({
        queryKey: ["patient", appointment?.patient_id],
      });
    },
    onError: () => toast.error("Error al registrar signos vitales"),
  });

  return {
    appointment,
    patient,
    isLoading: isFetchingAppointment || isFetchingPatient,
    addNote,
    removeNote,
    updateStatus,
    addVitals,
  };
}

