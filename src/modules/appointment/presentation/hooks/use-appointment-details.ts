import { Primitives } from "@/modules/shared/domain/primitives";
import { useQuery } from "@tanstack/react-query";
import { Appointment } from "../../domain/appointment";
import { Patient } from "@/modules/patient/domain/patient";
import { Medication } from "@/modules/prescription/domain/medication";

export function useAppointmentDetails(id: string) {
  const { data, isFetching } = useQuery<Primitives<Appointment> | null>({
    queryKey: ["appointment", id],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await fetch(`/api/appointment/${id}`);
      return response.json();
    },
  });

  return { appointment: data ?? null, isPendingAppointment: isFetching };
}

export function useAppointmentPatient(patientId: string | undefined) {
  const { data, isFetching } = useQuery<Primitives<Patient> | null>({
    queryKey: ["patient", patientId],
    initialData: null,
    refetchOnWindowFocus: false,
    enabled: !!patientId,
    queryFn: async () => {
      const response = await fetch(`/api/patient/${patientId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch patient data");
      }
      return response.json();
    },
  });

  return { patient: data ?? null, isPendingPatient: isFetching };
}

export function usePatientMedications(patientId: string | undefined) {
  const { data, isFetching } = useQuery<{ data: Primitives<Medication>[]; total: number } | null>({
    queryKey: ["medications", patientId],
    initialData: null,
    refetchOnWindowFocus: false,
    enabled: !!patientId,
    queryFn: async () => {
      const response = await fetch(`/api/prescription/medication?patientId=${patientId}&pageSize=50`);
      if (!response.ok) {
        throw new Error("Failed to fetch medications");
      }
      return response.json();
    },
  });

  return { medications: data?.data ?? [], isPendingMedications: isFetching };
}

export function usePatientDoctorHistory(
  patientId: string | undefined,
  doctorId: string | undefined,
  currentAppointmentId: string | undefined,
) {
  const { data, isFetching } = useQuery<{ data: Primitives<Appointment>[]; pagination: unknown } | null>({
    queryKey: ["appointment-history", patientId, doctorId],
    initialData: null,
    refetchOnWindowFocus: false,
    enabled: !!patientId && !!doctorId,
    queryFn: async () => {
      const params = new URLSearchParams({
        patientId: patientId!,
        doctorId: doctorId!,
        sort: "date",
        order: "DESC",
        pageSize: "50",
        page: "1",
      });
      const response = await fetch(`/api/appointment?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch appointment history");
      }
      return response.json();
    },
  });

  const history = (data?.data ?? []).filter(
    (a) => a.id !== currentAppointmentId && (a.status === "FINISHED" || a.status === "CANCELLED"),
  );

  return { history, isPendingHistory: isFetching };
}

