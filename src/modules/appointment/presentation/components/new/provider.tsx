"use client";
import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

type NewAppointmentContextType = {
  data: {
    patient: {
      name: string;
      email: string;
    };
    date: Date;
    time: string;
    motive: string;
    type: string;
    mode: string;
  };
  setData: Dispatch<SetStateAction<NewAppointmentContextType["data"]>>;
};

export const NewAppointmentContextProvider = createContext<NewAppointmentContextType | undefined>(undefined);

export const NewAppointmentProvider = ({ children }: { children: React.ReactNode }) => {
  const [appointmentData, setAppointmentData] = useState<NewAppointmentContextType["data"]>({
    date: new Date(),
    time: "",
    motive: "",
    type: "",
    mode: "",
    patient: {
      name: "",
      email: "",
    },
  });
  return (
    <NewAppointmentContextProvider.Provider value={{ data: appointmentData, setData: setAppointmentData }}>
      {children}
    </NewAppointmentContextProvider.Provider>
  );
};

export const useNewAppointment = () => {
  const context = useContext(NewAppointmentContextProvider);
  if (!context) {
    throw new Error("useAppointmentContext must be used within an AppointmentContextProvider");
  }
  return context;
};

