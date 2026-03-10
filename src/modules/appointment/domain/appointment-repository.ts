import { PaginatedQuery, PaginatedResult } from "@/modules/shared/domain/query";
import { Appointment, AppointmentId, AppointmentStatusValues } from "./appointment";

export type AppointmentSearchCriteria = PaginatedQuery & {
  organization_id: string;
  patient_id?: string;
  doctor_id?: string;
  date_from?: Date;
  date_to?: Date;
  status?: AppointmentStatusValues;
};

export interface AppointmentRepository {
  save(appointment: Appointment): Promise<void>;
  find(id: AppointmentId): Promise<Appointment | null>;
  search(criteria: AppointmentSearchCriteria): Promise<PaginatedResult<Appointment>>;
}

