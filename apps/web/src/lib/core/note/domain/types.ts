import type { session_note } from "@helsa/db/schema/note";

export type SessionNote = typeof session_note.$inferSelect;
export type NewSessionNote = typeof session_note.$inferInsert;
