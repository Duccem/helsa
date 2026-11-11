import type { BetterUser } from "@helsa/auth";
import { CURRENT_KEY_VERSION, encryptText } from "@/lib/infra/clinical-cipher";
import { zonedDay } from "@/lib/utils/zoned-time";
import { EnsurePortalPatient } from "../../patient/use-cases/ensure-portal-patient";
import { TaskRepository } from "../adapters/task-repository";
import { MoodRequired, TaskNotActive, TaskNotFound, TaskNotStarted } from "../domain/errors";

type AnswerTaskInput = {
  taskId: string;
  mood: number | null;
  content: string | null;
};

/** The patient answers one of their tasks for today. */
export class AnswerTask {
  private portal = new EnsurePortalPatient();
  private tasks = new TaskRepository();

  async execute(data: AnswerTaskInput, user: BetterUser, now = new Date()) {
    const patient = await this.portal.execute(user);
    const task = await this.tasks.getById(data.taskId, patient.therapist_id);
    if (!task || task.patient_id !== patient.id) throw new TaskNotFound();
    if (task.status !== "assigned") throw new TaskNotActive();

    const today = zonedDay(now, patient.timezone);
    if (task.starts_on > today) throw new TaskNotStarted();
    if (task.asks_mood && data.mood === null) throw new MoodRequired();

    await this.tasks.createEntry({
      task_id: task.id,
      entry_date: today,
      mood_score: task.asks_mood ? data.mood : null,
      content_enc: data.content ? encryptText(data.content, patient.therapist_id) : null,
      enc_key_version: data.content ? CURRENT_KEY_VERSION : null,
    });
  }
}
