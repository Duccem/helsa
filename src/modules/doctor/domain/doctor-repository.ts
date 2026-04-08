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

export abstract class DoctorRepository {
  abstract save(doctor: Doctor): Promise<void>;
  abstract find(id: DoctorId): Promise<Doctor | null>;
  abstract findByUserId(userId: DoctorUserId): Promise<Doctor | null>;
  abstract search(criteria: DoctorSearchCriteria): Promise<PaginatedResult<Doctor>>;
  abstract getDoctorPatients(doctorId: DoctorId): Promise<DoctorPatient[]>;
}

export abstract class SpecialtyRepository {
  abstract save(specialty: Specialty): Promise<void>;
  abstract find(id: SpecialtyId): Promise<Specialty | null>;
  abstract search(name?: string): Promise<Specialty[]>;
}

