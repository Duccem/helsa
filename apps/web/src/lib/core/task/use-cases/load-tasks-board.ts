import type { BetterUser } from "@helsa/auth";
import { openText } from "@/lib/infra/clinical-cipher";
import { zonedDay } from "@/lib/utils/zoned-time";
import { PatientRepository } from "../../patient/adapters/patient-repository";
import { TherapistRepository } from "../../therapist/adapters/therapist-repository";
import { assertTherapistRole } from "../../therapist/domain/guards";
import { TaskRepository } from "../adapters/task-repository";
import { adherence } from "../domain/adherence";

const DEFAULT_TIMEZONE = "America/Caracas";

const fullName = (row: { first_name: string; last_name: string }) =>
  `${row.first_name} ${row.last_name}`.trim();

/** Every task of the therapist with the patient's answers, decrypted and ready for review. */
export class LoadTasksBoard {
  private tasks = new TaskRepository();
  private patients = new PatientRepository();
  private therapists = new TherapistRepository();

  async execute(user: BetterUser, now = new Date()) {
    assertTherapistRole(user);

    const [rows, patients, therapist] = await Promise.all([
      this.tasks.listByTherapist(user.id),
      this.patients.list(user.id),
      this.therapists.getById(user.id),
    ]);
    const entries = await this.tasks.getEntries(rows.map(({ task }) => task.id));

    const timezone = therapist?.timezone ?? DEFAULT_TIMEZONE;
    const today = zonedDay(now, timezone);

    return {
      today,
      timezone,
      patients: patients.map((row) => ({
        id: row.id,
        name: fullName(row),
        preferredName: row.preferred_name,
        status: row.status,
      })),
      tasks: rows.map(({ task, ...row }) => {
        const own = entries
          .filter((entry) => entry.task_id === task.id)
          .map((entry) => {
            const body = openText(entry.content_enc, user.id, entry.enc_key_version);
            return {
              id: entry.id,
              entryDate: entry.entry_date,
              moodScore: entry.mood_score,
              content: body.text,
              locked: body.locked,
              seen: entry.seen_by_therapist_at !== null,
              createdAt: entry.created_at.toISOString(),
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
          patientId: task.patient_id,
          patientName: fullName(row),
          patientShortName: row.preferred_name || row.first_name,
          title: task.title,
          instructions: task.instructions,
          frequency: task.frequency,
          startsOn: task.starts_on,
          dueOn: task.due_on,
          asksMood: task.asks_mood,
          status: task.status,
          completedAt: task.completed_at?.toISOString() ?? null,
          endedAt: endedAt?.toISOString() ?? null,
          createdAt: task.created_at.toISOString(),
          overdue: task.status === "assigned" && task.due_on !== null && task.due_on < today,
          upcoming: task.status === "assigned" && task.starts_on > today,
          unseen: own.filter((entry) => !entry.seen).length,
          lastEntryDate: own[0]?.entryDate ?? null,
          adherence: adherence(
            { ...task, ended_on: endedAt ? zonedDay(endedAt, timezone) : null },
            own.map((entry) => entry.entryDate),
            today,
          ),
          entries: own,
        };
      }),
    };
  }
}

export type TasksBoard = Awaited<ReturnType<LoadTasksBoard["execute"]>>;
export type BoardTask = TasksBoard["tasks"][number];
export type BoardTaskEntry = BoardTask["entries"][number];
