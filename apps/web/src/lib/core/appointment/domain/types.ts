import type { appointment } from "@helsa/db/schema/appointment";

export type Appointment = typeof appointment.$inferSelect;
export type AppointmentStatus = Appointment["status"];
export type AppointmentModality = Appointment["modality"];
export type NewAppointment = typeof appointment.$inferInsert;
