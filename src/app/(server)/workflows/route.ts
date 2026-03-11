import { serve } from "inngest/next";
import { inngest } from "@/modules/shared/infrastructure/event-bus/inngest-client";
import { nextMedicationsReminders, sendNextMedicationsReminders } from "./prescription/next-medications-reminders";
import {
  forgottenMedicationsReminders,
  sendForgottenMedicationsReminders,
} from "./prescription/forgotten-medications-reminders";
import { rescheduleReminders } from "./prescription/reschedule-reminders";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    nextMedicationsReminders,
    sendNextMedicationsReminders,
    forgottenMedicationsReminders,
    sendForgottenMedicationsReminders,
    rescheduleReminders,
  ],
});

