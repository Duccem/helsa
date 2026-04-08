import { resend } from "@/modules/shared/infrastructure/email";
import { ReminderNotifier } from "../domain/reminder-notifier";
import NextDoseReminderEmail from "@/modules/shared/infrastructure/email/templates/next-dose-reminder-email";
import MissedDoseReminderEmail from "@/modules/shared/infrastructure/email/templates/missed-dose-reminder-email";
import { InfrastructureService } from "@/modules/shared/domain/service.";

@InfrastructureService()
export class ResendReminderNotifier extends ReminderNotifier {
  async notifyNextReminder(email: string, medicationName: string, reminderTime: Date): Promise<void> {
    await resend.emails.send({
      from: "Helsa <onboarding@resend.com>",
      to: [email],
      subject: `Medication Reminder: ${medicationName}`,
      react: NextDoseReminderEmail({ medicationName, reminderTime }),
    });
  }
  async notifyMissedReminder(email: string, medicationName: string, reminderTime: Date): Promise<void> {
    await resend.emails.send({
      from: "Helsa <onboarding@resend.com>",
      to: [email],
      subject: `Medication forgotten: ${medicationName}`,
      react: MissedDoseReminderEmail({ medicationName, reminderTime }),
    });
  }
}

