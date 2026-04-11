import { DoctorUserId } from "@/modules/doctor/domain/doctor";
import { DoctorNotFound } from "@/modules/doctor/domain/doctor-not-found";
import { DoctorRepository } from "@/modules/doctor/domain/doctor-repository";
import { HomeMetricRepository } from "../domain/home-metric-repository";

export class GetDoctorHomeMetrics {
  constructor(
    private readonly doctorRepository: DoctorRepository,
    private readonly homeMetricRepository: HomeMetricRepository,
  ) {}

  async execute(userId: string, date: Date = new Date()) {
    const doctor = await this.doctorRepository.findByUserId(DoctorUserId.fromString(userId));

    if (!doctor) {
      throw new DoctorNotFound(userId);
    }

    return this.homeMetricRepository.getMetrics(date, doctor.id.value);
  }
}
