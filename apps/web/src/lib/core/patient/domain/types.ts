import type { patient } from "@helsa/db/schema/patient";

export type Patient = typeof patient.$inferSelect;
export type NewPatient = typeof patient.$inferInsert;
export type PatientStatus = Patient["status"];
