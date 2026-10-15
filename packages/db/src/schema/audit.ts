import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

import { user } from "./auth";
import { patient } from "./patient";
import { therapist } from "./therapist";

export const audit_action = pgEnum("audit_action", [
  "view",
  "create",
  "update",
  "delete",
  "export",
  "sign",
]);

// Who viewed or changed clinical information. The backend only inserts rows.
export const access_log = pgTable(
  "access_log",
  (t) => ({
    id: t.uuid().primaryKey().$defaultFn(v7),
    therapist_id: t
      .text()
      .notNull()
      .references(() => therapist.user_id, { onDelete: "cascade" }),
    actor_user_id: t.text().references(() => user.id, { onDelete: "set null" }),
    patient_id: t.uuid().references(() => patient.id, { onDelete: "set null" }),
    entity_type: t.text().notNull(), // 'patient', 'session_note', 'file', ...
    entity_id: t.text().notNull(),
    action: audit_action().notNull(),
    ip: t.inet(),
    user_agent: t.text(),
    occurred_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
  })
);
