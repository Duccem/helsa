import { inngest } from "@/modules/shared/infrastructure/event-bus/inngest-client";

export const nextMedicationsReminders = inngest.createFunction(
  { id: "next-medications-reminders", name: "Next Medications Reminders" },
  { cron: "TZ=America/Caracas */15 * * * *" },
  async ({ step, event }) => {
    console.log("Running next medications reminders workflow");
  },
);

