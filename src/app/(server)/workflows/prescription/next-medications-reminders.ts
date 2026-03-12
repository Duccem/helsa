import { SearchReminders } from "@/modules/prescription/application/search-reminders";
import { DrizzlePrescriptionRepository } from "@/modules/prescription/infrastructure/persistence/drizzle-prescription-repository";
import { ResendReminderNotifier } from "@/modules/prescription/infrastructure/resend-reminder-notifier";
import { inngest } from "@/modules/shared/infrastructure/event-bus/inngest-client";
import { addMinutes } from "date-fns";

export const nextMedicationsReminders = inngest.createFunction(
  { id: "next-medications-reminders", name: "Next Medications Reminders" },
  { cron: "TZ=America/Caracas */15 * * * *" },
  async ({ step }) => {
    const inFifteenMinutes = addMinutes(new Date(), 15);
    const reminders = await step.run("get-next-medications-reminders", async () => {
      const service = new SearchReminders(new DrizzlePrescriptionRepository());
      const data = await service.execute({
        start_date: new Date(),
        end_date: inFifteenMinutes,
        page: 1,
        pageSize: 1000,
      });

      return data.data;
    });
    const newEvents = reminders.map((reminder) => ({
      name: "helsa/prescription.send-reminder",
      data: { id: reminder.id, medication_id: reminder.medication_id, patient_id: reminder.patient_id },
    }));

    await step.sendEvent("send-next-medications-reminders", newEvents);
  },
);

export const sendNextMedicationsReminders = inngest.createFunction(
  { id: "send-next-medications-reminders", name: "Send Next Medications Reminders" },
  { event: "helsa/prescription.send-reminder" },
  async ({ event, step }) => {
    const { id, medication_id } = event.data;
    const patient = await step.run("get-patient-info", async () => {
      return {};
    });
    const medication = await step.run("get-medication-info", async () => {
      return {};
    });
    const reminder = await step.run("get-reminder-info", async () => {
      console.log(`Getting info for reminder ${id}`);
      return {};
    });
    await step.run("send-reminder-notification", async () => {
      const notifier = new ResendReminderNotifier();
      await notifier.notifyNextReminder("", "", new Date());
      console.log(`Sending reminder for medication ${medication_id} to patient ${patient}`);
    });
  },
);

