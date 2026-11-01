import type { patient_task, task_entry } from "@helsa/db/schema/task";

export type PatientTask = typeof patient_task.$inferSelect;
export type NewPatientTask = typeof patient_task.$inferInsert;
export type TaskEntry = typeof task_entry.$inferSelect;
