import { serve } from "inngest/next";
import { inngest } from "@/modules/shared/infrastructure/event-bus/inngest-client";
import { nextMedicationsReminders, sendNextMedicationsReminders } from "./prescription/next-medications-reminders";
import {
  forgottenMedicationsReminders,
  sendForgottenMedicationsReminders,
} from "./prescription/forgotten-medications-reminders";
import { rescheduleReminders } from "./prescription/reschedule-reminders";
import { initUserBilling } from "./billing/init-user-billing";
import { createPatient } from "./patient/create-patient";
import { createDoctor } from "./doctor/create-doctor";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    nextMedicationsReminders,
    sendNextMedicationsReminders,
    forgottenMedicationsReminders,
    sendForgottenMedicationsReminders,
    rescheduleReminders,
    initUserBilling,
    createPatient,
    createDoctor,
  ],
});

