import type { file } from "@helsa/db/schema/patient";

export type StoredFile = typeof file.$inferSelect;
export type NewStoredFile = typeof file.$inferInsert;
