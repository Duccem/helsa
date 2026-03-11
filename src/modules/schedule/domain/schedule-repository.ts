import { PaginatedQuery, PaginatedResult } from "@/modules/shared/domain/query";
import { AvailabilitySlot } from "./availability-slot";
import { Schedule, ScheduleDoctorId } from "./schedule";

export type SearchSchedulesCriteria = PaginatedQuery & {
  doctor_id?: string;
  next_availability_generation?: Date;
  max_appointments_per_day?: number;
};

export interface ScheduleRepository {
  save(schedule: Schedule): Promise<void>;
  findByDoctorId(doctorId: ScheduleDoctorId): Promise<Schedule | null>;
  searchSchedules(criteria: SearchSchedulesCriteria): Promise<PaginatedResult<Schedule>>;
  saveAvailabilities(slots: AvailabilitySlot[]): Promise<void>;
  deleteAvailabilitiesByDoctorIdAndRange(
    doctorId: ScheduleDoctorId,
    date_from: Date,
    date_to: Date,
    state?: "TAKEN" | "AVAILABLE",
  ): Promise<void>;
  findAvailabilitiesByDoctorId(
    doctorId: ScheduleDoctorId,
    date_from?: Date,
    date_to?: Date,
    state?: "TAKEN" | "AVAILABLE",
  ): Promise<AvailabilitySlot[]>;
}

