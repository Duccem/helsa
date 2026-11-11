import type { BetterUser } from "@helsa/auth";
import { openText } from "@/lib/infra/clinical-cipher";
import { addDays, zonedDay } from "@/lib/utils/zoned-time";
import { EnsurePortalPatient } from "../../patient/use-cases/ensure-portal-patient";
import { TaskRepository } from "../adapters/task-repository";
import { adherence } from "../domain/adherence";

/** Whether the patient still has to answer a task in its current period. */
export type PortalTaskState = "to_answer" | "answered" | "overdue" | "not_started" | "closed";

/** The patient's tasks with their own answers, newest task first. */
export class LoadPatientTasks {
  private portal = new EnsurePortalPatient();
  private tasks = new TaskRepository();

  async execute(user: BetterUser, now = new Date()) {
    const patient = await this.portal.execute(user);
    const today = zonedDay(now, patient.timezone);

    const rows = await this.tasks.listByPatient(patient.id, patient.therapist_id);
    const entries = await this.tasks.getEntries(rows.map((task) => task.id));

    const tasks = rows.map((task) => {
      const own = entries
        .filter((entry) => entry.task_id === task.id)
        .map((entry) => {
          // Answers are sealed with the therapist's key, like the rest of the record.
          const body = openText(entry.content_enc, patient.therapist_id, entry.enc_key_version);
          return {
            id: entry.id,
            entryDate: entry.entry_date,
            moodScore: entry.mood_score,
            content: body.text,
            locked: body.locked,
            seen: entry.seen_by_therapist_at !== null,
          };
        });
      const endedAt =
        task.status === "completed"
          ? (task.completed_at ?? task.updated_at)
          : task.status === "cancelled"
            ? task.updated_at
            : null;

      return {
        id: task.id,
        title: task.title,
        instructions: task.instructions,
        frequency: task.frequency,
        startsOn: task.starts_on,
        dueOn: task.due_on,
        asksMood: task.asks_mood,
        status: task.status,
        state: portalTaskState(task, own, today),
        answeredToday: own.some((entry) => entry.entryDate === today),
        adherence: adherence(
          { ...task, ended_on: endedAt ? zonedDay(endedAt, patient.timezone) : null },
          own.map((entry) => entry.entryDate),
          today,
        ),
        entries: own,
      };
    });

    return { today, tasks };
  }
}

const stateOrder: Record<PortalTaskState, number> = {
  overdue: 0,
  to_answer: 1,
  answered: 2,
  not_started: 3,
  closed: 4,
};

export function sortPortalTasks<T extends { state: PortalTaskState }>(tasks: T[]) {
  return [...tasks].sort((a, b) => stateOrder[a.state] - stateOrder[b.state]);
}

export function portalTaskState(
  task: {
    status: "assigned" | "completed" | "cancelled";
    frequency: "once" | "daily" | "weekly";
    starts_on: string;
    due_on: string | null;
  },
  entries: Array<{ entryDate: string }>,
  today: string,
): PortalTaskState {
  if (task.status !== "assigned") return "closed";
  if (task.starts_on > today) return "not_started";
  const last = entries[0]?.entryDate ?? null;
  const answered =
    task.frequency === "once"
      ? last !== null
      : task.frequency === "daily"
        ? last === today
        : last !== null && last >= addDays(today, -6);
  if (answered) return "answered";
  if (task.due_on && task.due_on < today) return "overdue";
  return "to_answer";
}

export type PatientTasks = Awaited<ReturnType<LoadPatientTasks["execute"]>>;
export type PortalTask = PatientTasks["tasks"][number];
export type PortalTaskEntry = PortalTask["entries"][number];
