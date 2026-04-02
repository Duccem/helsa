"use client";

import { Appointment } from "@/modules/appointment/domain/appointment";
import { Primitives } from "@/modules/shared/domain/primitives";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { createContext, useContext } from "react";
import {
  useAppointmentDetails,
  useAppointmentPatient,
  usePatientDoctorHistory,
  usePatientMedications,
} from "../../hooks/use-appointment-details";
import { Patient } from "@/modules/patient/domain/patient";
import { Medication } from "@/modules/prescription/domain/medication";

type AppointmentDetailContextType = {
  appointment: Primitives<Appointment> | null;
  patient: Primitives<Patient> | null;
  medications: Primitives<Medication>[];
  history: Primitives<Appointment>[];
  isPendingAppointment: boolean;
  isPendingPatient: boolean;
  isPendingMedications: boolean;
  isPendingHistory: boolean;
};

const AppointmentDetailContext = createContext<AppointmentDetailContextType | null>(null);

export const AppointmentDetailProvider = ({ children }: { children: React.ReactNode }) => {
  const { id } = useParams<{ id: string }>();

  const { appointment, isPendingAppointment } = useAppointmentDetails(id);
  const { patient, isPendingPatient } = useAppointmentPatient(appointment?.patient_id ?? undefined);
  const { medications, isPendingMedications } = usePatientMedications(appointment?.patient_id ?? undefined);
  const { history, isPendingHistory } = usePatientDoctorHistory(
    appointment?.patient_id ?? undefined,
    appointment?.doctor_id ?? undefined,
    appointment?.id ?? undefined,
  );

  return (
    <AppointmentDetailContext.Provider
      value={{
        appointment,
        isPendingAppointment,
        patient,
        isPendingPatient,
        medications,
        isPendingMedications,
        history,
        isPendingHistory,
      }}
    >
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

