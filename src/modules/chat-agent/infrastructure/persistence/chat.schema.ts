import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const chat = pgTable("chat", {
  id: uuid("id").primaryKey().$defaultFn(v7),
  title: text("title").notNull(),
  user_id: uuid("user_id").notNull(),
  messages: jsonb("messages").default([]).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  status: text("status").notNull(),
});

