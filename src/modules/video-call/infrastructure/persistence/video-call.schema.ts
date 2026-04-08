import { pgTable } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const video_call = pgTable("video_call", (table) => ({
  id: table.uuid("id").primaryKey().$defaultFn(v7),
  appointment_id: table.uuid("appointment_id").notNull(),
  video_recording_url: table.text("video_recording_url"),
  transcription: table.text("transcription"),
}));
