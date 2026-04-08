import { PaginatedQuery, PaginatedResult } from "@/modules/shared/domain/query";
import { AvailabilitySlot } from "./availability-slot";
import { Schedule, ScheduleDoctorId } from "./schedule";

export type SearchSchedulesCriteria = PaginatedQuery & {
  doctor_id?: string;
  next_availability_generation?: Date;
  max_appointments_per_day?: number;
};

export abstract class ScheduleRepository {
  abstract save(schedule: Schedule): Promise<void>;
  abstract findByDoctorId(doctorId: ScheduleDoctorId): Promise<Schedule | null>;
  abstract searchSchedules(criteria: SearchSchedulesCriteria): Promise<PaginatedResult<Schedule>>;
  abstract saveAvailabilities(slots: AvailabilitySlot[]): Promise<void>;
  abstract deleteAvailabilitiesByDoctorIdAndRange(
    doctorId: ScheduleDoctorId,
    date_from: Date,
    date_to: Date,
    state?: "TAKEN" | "AVAILABLE",
  ): Promise<void>;
  abstract findAvailabilitiesByDoctorId(
    doctorId: ScheduleDoctorId,
    date_from?: Date,
    date_to?: Date,
    state?: "TAKEN" | "AVAILABLE",
  ): Promise<AvailabilitySlot[]>;
}

