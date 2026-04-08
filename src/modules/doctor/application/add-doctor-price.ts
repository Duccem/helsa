import { ApplicationService } from "@/modules/shared/domain/service.";
import { DoctorId } from "../domain/doctor";
import { DoctorNotFound } from "../domain/doctor-not-found";
import { DoctorRepository } from "../domain/doctor-repository";

@ApplicationService()
export class AddDoctorPrice {
  constructor(private readonly repository: DoctorRepository) {}

  async execute(doctor_id: string, amount: number, mode: string): Promise<void> {
    const doctor = await this.repository.find(DoctorId.fromString(doctor_id));
    if (!doctor) {
      throw new DoctorNotFound(doctor_id);
    }

    doctor.addPrice(amount, mode);
    await this.repository.save(doctor);
  }
}

