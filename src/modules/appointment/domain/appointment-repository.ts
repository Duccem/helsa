import type { PaginatedQuery, PaginatedResult } from "@/modules/shared/domain/query";
import type {
  Appointment,
  AppointmentId,
  AppointmentModeValues,
  AppointmentStatusValues,
  AppointmentTypeValues,
} from "./appointment";
import { AppointmentNoteId } from "./appointment-note";

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

export abstract class AppointmentRepository {
  abstract save(appointment: Appointment): Promise<void>;
  abstract find(id: AppointmentId): Promise<Appointment | null>;
  abstract search(criteria: AppointmentSearchCriteria): Promise<PaginatedResult<Appointment>>;
  abstract removeNote(appointment_id: AppointmentId, note_id: AppointmentNoteId): Promise<void>;
}

