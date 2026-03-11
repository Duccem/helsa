import { serve } from "inngest/next";
import { inngest } from "@/modules/shared/infrastructure/event-bus/inngest-client";
import { nextMedicationsReminders } from "./prescription/next-medications-reminders";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [nextMedicationsReminders],
});

