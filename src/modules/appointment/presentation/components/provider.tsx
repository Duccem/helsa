import { createContext } from "react";

type AppointmentContextType = {
  patient?: {
    name: string;
    email: string;
  };
};

export const AppointmentContextProvider = createContext({});

export const AppointmentContext = ({ children }: { children: React.ReactNode }) => {
  return <AppointmentContextProvider.Provider value={{}}>{children}</AppointmentContextProvider.Provider>;
};

export const useAppointmentContext = () => {
  return createContext(AppointmentContextProvider);
};

