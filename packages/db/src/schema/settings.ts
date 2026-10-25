import { pgTable } from "drizzle-orm/pg-core";

import { user } from "./auth";

export type TimeFormat = "24h" | "12h";
export type CurrencyDisplay = "usd" | "ves" | "both";

/** How the app looks and reads for one person. Stored partial; the app fills defaults. */
export type AppPreferences = {
  timeFormat: TimeFormat;
  /** 0 = Monday, 6 = Sunday */
  weekStartsOn: 0 | 6;
  currencyDisplay: CurrencyDisplay;
  /** Hide patient names on the dashboard home, for screens others can see. */
  privateMode: boolean;
};

export type NotificationChannel = "email" | "app";

export type NotificationEvent =
  | "booking_new"
  | "booking_cancelled"
  | "reschedule_request"
  | "task_completed"
  | "payment_recorded"
  | "reminder_failed"
  | "weekly_summary";

export type NotificationPreferences = {
  events: Partial<Record<NotificationEvent, NotificationChannel[]>>;
  /** Patient reminders sent by Helsa on the therapist's behalf. */
  patientReminders: {
    h24: boolean;
    h2: boolean;
    channel: "whatsapp" | "email" | "both";
  };
  /** Local hours ("22:00" → "07:00") when the app stays silent. */
  quietHours: { enabled: boolean; from: string; to: string };
};

// Per-user settings shared by therapists and patients.
export const user_settings = pgTable("user_settings", (t) => ({
  user_id: t
    .uuid()
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  preferences: t.jsonb().$type<Partial<AppPreferences>>().notNull().default({}),
  notifications: t
    .jsonb()
    .$type<Partial<NotificationPreferences>>()
    .notNull()
    .default({}),
  updated_at: t
    .timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}));
