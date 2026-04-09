import { DoctorUserId } from "../domain/doctor";
import { DoctorNotFound } from "../domain/doctor-not-found";
import { DoctorRepository } from "../domain/doctor-repository";

export class GetDoctorPatients {
  constructor(private readonly doctorRepository: DoctorRepository) {}

  async execute(user_id: string) {
    const doctor = await this.doctorRepository.findByUserId(DoctorUserId.fromString(user_id));

    if (!doctor) {
      throw new DoctorNotFound(user_id);
    }

    const patients = await this.doctorRepository.getDoctorPatients(doctor.id);
    return patients.map((p) => p.toPrimitives());
  }
}

