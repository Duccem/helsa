
import { bytea, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

import { appointment } from "./appointment";

export const video_provider = pgEnum("video_provider", ["livekit", "daily", "jitsi"]);
export const participant_role = pgEnum("participant_role", ["therapist", "patient"]);

export const video_room = pgTable(
  "video_room",
  (t) => ({
    id: t.uuid().primaryKey().$defaultFn(v7),
    appointment_id: t
      .uuid()
      .notNull()
      .unique()
      .references(() => appointment.id, { onDelete: "cascade" }),
    // No default: adding an enum value and using it in one migration fails in Postgres.
    provider: video_provider().notNull(),
    room_name: t.text().notNull().unique(),
    patient_join_token_hash: bytea().unique(), // join link without login (hash only)
    opens_at: t.timestamp({ withTimezone: true }).notNull(), // e.g. 10 min before
    closes_at: t.timestamp({ withTimezone: true }).notNull(),
    started_at: t.timestamp({ withTimezone: true }), // second participant joins
    ended_at: t.timestamp({ withTimezone: true }),
    duration_seconds: t.integer(),
    audio_only_seconds: t.integer().notNull().default(0),
    reconnect_count: t.integer().notNull().default(0),
    billed_participant_minutes: t.numeric({ precision: 10, scale: 2 }).notNull().default("0"),
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
  })
);

// Per-participant events (join, leave, drop, switch to audio).
export const video_participant_event = pgTable(
  "video_participant_event",
  (t) => ({
    id: t.uuid().primaryKey().$defaultFn(v7),
    room_id: t
      .uuid()
      .notNull()
      .references(() => video_room.id, { onDelete: "cascade" }),
    role: participant_role().notNull(),
    event_type: t.text().notNull(),
    occurred_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    bitrate_kbps: t.integer(),
    packet_loss_pct: t.numeric({ precision: 5, scale: 2 }),
    client_info: t.jsonb(), // browser, OS, network type
  })
);
