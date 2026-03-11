import { MarkRemindersAsForgotten } from "@/modules/prescription/application/mark-reminders-as-forgotten";
import { SearchReminders } from "@/modules/prescription/application/search-reminders";
import { DrizzlePrescriptionRepository } from "@/modules/prescription/infrastructure/persistence/drizzle-prescription-repository";
import { inngest } from "@/modules/shared/infrastructure/event-bus/inngest-client";
import { subHours } from "date-fns";

export const rescheduleReminders = inngest.createFunction(
  { id: "reschedule-reminders", name: "Reschedule Reminders" },
  { event: "helsa/prescription.reschedule-reminders" },
  async ({ step }) => {
    const reminders = await step.run("get-reminders", async () => {
      const twoHoursAgo = subHours(new Date(), 2);
      const service = new SearchReminders(new DrizzlePrescriptionRepository());
      const data = await service.execute({
        is_taken: false,
        forgotten: false,
        page: 1,
        pageSize: 1000,
        end_date: twoHoursAgo,
      });

      return data.data;
    });

    if (reminders.length === 0) {
      return { message: "No reminders to reschedule" };
    }

    await step.run("reschedule-reminders", async () => {
      const service = new MarkRemindersAsForgotten(new DrizzlePrescriptionRepository());

      await Promise.all(
        reminders.map((reminder) => service.execute(reminder.prescription_id, reminder.medication_id, reminder.id)),
      );
    });
  },
);

