import type { PatientTask } from "./types";

type TaskShape = Pick<PatientTask, "frequency" | "starts_on" | "due_on" | "status"> & {
  /** Day the task stopped (completed or cancelled), if it did. */
  ended_on: string | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function dayIndex(day: string) {
  const [year = 0, month = 1, date = 1] = day.split("-").map(Number);
  return Math.round(Date.UTC(year, month - 1, date) / DAY_MS);
}

/**
 * How many answers the task has asked for so far and how many periods the
 * patient covered. A daily task counts days with an answer, a weekly one
 * counts weeks (from the start day), a one-off task counts one.
 */
export function adherence(task: TaskShape, entryDays: string[], today: string) {
  const start = dayIndex(task.starts_on);
  const limits = [dayIndex(today)];
  if (task.due_on) limits.push(dayIndex(task.due_on));
  if (task.ended_on) limits.push(dayIndex(task.ended_on));
  const end = Math.min(...limits);

  if (end < start) return { done: 0, expected: 0 };

  if (task.frequency === "once") {
    return { done: entryDays.length > 0 ? 1 : 0, expected: 1 };
  }

  const size = task.frequency === "weekly" ? 7 : 1;
  const expected = Math.floor((end - start) / size) + 1;
  const covered = new Set(
    entryDays
      .map((day) => Math.floor((dayIndex(day) - start) / size))
      .filter((period) => period >= 0 && period < expected),
  );
  return { done: covered.size, expected };
}
