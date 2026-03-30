import type { PaginatedQuery, PaginatedResult } from "@/modules/shared/domain/query";
import type {
  Appointment,
  AppointmentId,
  AppointmentModeValues,
  AppointmentStatusValues,
  AppointmentTypeValues,
} from "./appointment";

export type AppointmentSortBy = "date" | "status" | "created_at";
export type AppointmentSortOrder = "ASC" | "DESC";

export type AppointmentSearchCriteria = PaginatedQuery & {
  organization_id?: string;
  patient_id?: string;
  doctor_id?: string;
  date_from?: Date;
  date_to?: Date;
  hour?: string;
  status?: AppointmentStatusValues;
  mode?: AppointmentModeValues;
  type?: AppointmentTypeValues;
  sort?: AppointmentSortBy;
  order?: AppointmentSortOrder;
};

export interface AppointmentRepository {
  save(appointment: Appointment): Promise<void>;
  find(id: AppointmentId): Promise<Appointment | null>;
  search(criteria: AppointmentSearchCriteria): Promise<PaginatedResult<Appointment>>;
}

