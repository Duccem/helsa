import { DoctorId } from "../domain/doctor";
import { DoctorNotFound } from "../domain/doctor-not-found";
import { DoctorRepository } from "../domain/doctor-repository";

export class UpdateDoctorPrice {
  constructor(private readonly repository: DoctorRepository) {}

  async execute(doctor_id: string, amount: number): Promise<void> {
    const doctor = await this.repository.find(DoctorId.fromString(doctor_id));
    if (!doctor) {
      throw new DoctorNotFound(doctor_id);
    }

    doctor.addPrice(amount);
    await this.repository.save(doctor);
  }
}

