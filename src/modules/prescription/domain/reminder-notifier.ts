export interface ReminderNotifier {
  notifyNextReminder(email: string, medicationName: string, reminderTime: Date): Promise<void>;
  notifyMissedReminder(email: string, medicationName: string, reminderTime: Date): Promise<void>;
}
