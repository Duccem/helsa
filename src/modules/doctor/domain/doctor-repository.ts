import { PaginatedQuery, PaginatedResult } from "@/modules/shared/domain/query";
import { Doctor, DoctorId, DoctorUserId } from "./doctor";
import { Specialty, SpecialtyId } from "./specialty";
import { DoctorPatient } from "./doctor-patient";

export type DoctorSearchCriteria = PaginatedQuery & {
  specialty_id?: string;
  min_score?: number;
  min_experience?: number;
  max_price?: number;
};

export interface DoctorRepository {
  save(doctor: Doctor): Promise<void>;
  find(id: DoctorId): Promise<Doctor | null>;
  findByUserId(userId: DoctorUserId): Promise<Doctor | null>;
  search(criteria: DoctorSearchCriteria): Promise<PaginatedResult<Doctor>>;
  getDoctorPatients(doctorId: DoctorId): Promise<DoctorPatient[]>;
}

export interface SpecialtyRepository {
  save(specialty: Specialty): Promise<void>;
  find(id: SpecialtyId): Promise<Specialty | null>;
  search(name?: string): Promise<Specialty[]>;
}

