import { SearchReminders } from "@/modules/prescription/application/search-reminders";
import { DrizzlePrescriptionRepository } from "@/modules/prescription/infrastructure/persistence/drizzle-prescription-repository";
import { inngest } from "@/modules/shared/infrastructure/event-bus/inngest-client";
import { subHours } from "date-fns";

export const forgottenMedicationsReminders = inngest.createFunction(
  { id: "forgotten-medications-reminders", name: "Forgotten Medications Reminders" },
  { cron: "TZ=America/Caracas 0 * * * *" },
  async ({ step }) => {
    const inLastHour = subHours(new Date(), 1);
    const reminders = await step.run("get-forgotten-medications-reminders", async () => {
      const service = new SearchReminders(new DrizzlePrescriptionRepository());
      const data = await service.execute({
        end_date: new Date(),
        start_date: inLastHour,
        page: 1,
        pageSize: 1000,
        is_taken: false,
      });

      return data.data;
    });
    const newEvents = reminders.map((reminder) => ({
      name: "helsa/prescription.send-forgotten-reminder",
      data: { id: reminder.id, medication_id: reminder.medication_id, patient_id: reminder.patient_id },
    }));

    await step.sendEvent("send-next-medications-reminders", newEvents);
  },
);

export const sendForgottenMedicationsReminders = inngest.createFunction(
  { id: "send-next-medications-reminders", name: "Send Forgotten Medications Reminders" },
  { event: "helsa/prescription.send-forgotten-reminder" },
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
      console.log(`Sending reminder for medication ${medication_id} to patient ${patient}`);
    });
  },
);

