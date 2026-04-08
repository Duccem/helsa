export abstract class ReminderNotifier {
  abstract notifyNextReminder(email: string, medicationName: string, reminderTime: Date): Promise<void>;
  abstract notifyMissedReminder(email: string, medicationName: string, reminderTime: Date): Promise<void>;
}
