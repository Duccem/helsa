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
  status?: AppointmentStatusValues;
  mode?: AppointmentModeValues;
  type?: AppointmentTypeValues;
  sort?: AppointmentSortBy;
  order?: AppointmentSortOrder;
};

export type AppointmentListItem = {
  id: string;
  organization_id: string | null;
  patient_id: string;
  patient_name: string | null;
  doctor_id: string;
  doctor_name: string | null;
  date: Date;
  motive: string;
  type: AppointmentTypeValues;
  mode: AppointmentModeValues;
  status: AppointmentStatusValues;
  created_at: Date;
  updated_at: Date;
};

export interface AppointmentRepository {
  save(appointment: Appointment): Promise<void>;
  find(id: AppointmentId): Promise<Appointment | null>;
  search(criteria: AppointmentSearchCriteria): Promise<PaginatedResult<Appointment>>;
  searchList(criteria: AppointmentSearchCriteria): Promise<PaginatedResult<AppointmentListItem>>;
}

