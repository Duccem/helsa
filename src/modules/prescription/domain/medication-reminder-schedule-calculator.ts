export class MedicationReminderScheduleCalculator {
  static calculateNextScheduledTime(frequency: string, from: Date = new Date()): Date {
    const normalized = frequency.trim().toLowerCase();
    const amount = Number.parseInt(normalized.match(/\d+/)?.[0] ?? "1", 10);

    if (normalized.includes("hour")) {
      return new Date(from.getTime() + amount * 60 * 60 * 1000);
    }

    if (normalized.includes("day")) {
      return new Date(from.getTime() + amount * 24 * 60 * 60 * 1000);
    }

    return new Date(from.getTime() + 24 * 60 * 60 * 1000);
  }
}

