import { DoctorId } from "../domain/doctor";
import { DoctorNotFound } from "../domain/doctor-not-found";
import { DoctorRepository } from "../domain/doctor-repository";

export class GetDoctorDetails {
  constructor(private readonly repository: DoctorRepository) {}

  async execute(doctorId: string) {
    const doctor = await this.repository.find(DoctorId.fromString(doctorId));
    if (!doctor) {
      throw new DoctorNotFound(doctorId);
    }

    return doctor;
  }
}

