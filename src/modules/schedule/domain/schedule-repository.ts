import { AvailabilitySlot } from "./availability-slot";
import { Schedule, ScheduleDoctorId } from "./schedule";

export interface ScheduleRepository {
  save(schedule: Schedule): Promise<void>;
  findByDoctorId(doctorId: ScheduleDoctorId): Promise<Schedule | null>;
  saveAvailabilities(slots: AvailabilitySlot[]): Promise<void>;
  deleteAvailabilitiesByDoctorIdAndRange(doctorId: ScheduleDoctorId, date_from: Date, date_to: Date): Promise<void>;
  findAvailabilitiesByDoctorId(
    doctorId: ScheduleDoctorId,
    date_from?: Date,
    date_to?: Date,
  ): Promise<AvailabilitySlot[]>;
}

