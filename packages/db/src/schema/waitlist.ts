import { pgTable } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

// Landing page sign-ups for early access.
export const waitlist_entry = pgTable(
  "waitlist_entry",
  (t) => ({
    id: t.uuid().primaryKey().$defaultFn(v7),
    name: t.text().notNull(),
    email: t.text().notNull().unique(), // stored lowercased
    profession: t.text().notNull(),
    city: t.text().notNull(),
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
  })
);
