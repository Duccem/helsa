import type { user_settings } from "@helsa/db/schema/settings";

export type UserSettings = typeof user_settings.$inferSelect;