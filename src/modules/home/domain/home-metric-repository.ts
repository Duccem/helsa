import { DoctorHomeMetrics } from "./home-metric";

export abstract class HomeMetricRepository {
  abstract getMetrics(date: Date, doctor_id: string): Promise<DoctorHomeMetrics>;
}

