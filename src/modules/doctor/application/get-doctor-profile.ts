import { DoctorUserId } from "../domain/doctor";
import { DoctorNotFound } from "../domain/doctor-not-found";
import { DoctorRepository } from "../domain/doctor-repository";

export class GetDoctorProfile {
  constructor(private readonly repository: DoctorRepository) {}

  async execute(userId: string) {
    const doctor = await this.repository.findByUserId(DoctorUserId.fromString(userId));
    if (!doctor) {
      throw new DoctorNotFound(userId);
    }

    return doctor.toPrimitives();
  }
}
