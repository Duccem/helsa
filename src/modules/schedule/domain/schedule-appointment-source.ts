export type DoctorAppointment = {
  date: Date;
};

export interface ScheduleAppointmentSource {
  listByDoctorId(doctor_id: string, date_from: Date, date_to: Date): Promise<DoctorAppointment[]>;
}

