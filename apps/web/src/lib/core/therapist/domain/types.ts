import type { availability_rule, therapist, therapist_rate } from "@helsa/db/schema/therapist";

export type Therapist = typeof therapist.$inferSelect;
export type TherapistRate = typeof therapist_rate.$inferSelect;
export type TherapistAvailabilityRule = typeof availability_rule.$inferSelect;