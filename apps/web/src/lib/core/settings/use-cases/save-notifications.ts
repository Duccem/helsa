import type { BetterUser } from "@helsa/auth";
import { TherapistRepository } from "../../therapist/adapters/therapist-repository";
import { TherapistNotFound } from "../../therapist/domain/errors";
import { SettingsRepository } from "../adapters/settings-repository";

type EventTypes = "booking_new" |
  "booking_cancelled" |
  "reschedule_request" |
  "task_completed" |
  "payment_recorded" |
  "reminder_failed" |
  "weekly_summary";
type SaveNotificationsSettingsInput = {
  remindersEnabled: boolean;
  events: Record<EventTypes, ("email" | "app")[]>;
  patientReminders: {
    h24: boolean;
    h2: boolean;
    channel: "whatsapp" | "email" | "both";
  },
  quietHours: {
    enabled: boolean;
    from: string;
    to: string;
  }
}
export class SaveNotificationsSettings {
  private repository = new SettingsRepository();
  private therapistRepository = new TherapistRepository();

  async execute(data: SaveNotificationsSettingsInput, user: BetterUser) {
    const therapist = await this.therapistRepository.getById(user.id);

    if (!therapist) {
      throw new TherapistNotFound();
    }

    therapist.reminders_enabled = data.remindersEnabled;

    await this.therapistRepository.update(therapist);

    await this.repository.save(user.id, { notifications: data });
  }
}