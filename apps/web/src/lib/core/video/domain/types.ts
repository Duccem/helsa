import type {
  video_participant_event,
  video_room,
} from "@helsa/db/schema/video";

export type VideoRoom = typeof video_room.$inferSelect;
export type NewVideoRoom = typeof video_room.$inferInsert;
export type NewVideoEvent = typeof video_participant_event.$inferInsert;

/** Who is in the call: the therapist moderates, a guest is a patient with no account. */
export type VideoRole = "therapist" | "patient" | "guest";
