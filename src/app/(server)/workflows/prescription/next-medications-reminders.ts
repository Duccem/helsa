import { GetUser } from "@/modules/auth/application/get-user";
import { DrizzleUserRepository } from "@/modules/auth/infrastructure/persistence/drizzle-user-repository";
import { GetPatientDetails } from "@/modules/patient/application/get-patient-details";
import { DrizzlePatientRepository } from "@/modules/patient/infrastructure/persistence/drizzle-patient-repository";
import { GetPrescriptionDetailsSystem } from "@/modules/prescription/application/get-prescription-details-system";
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
      data: {
        id: reminder.id,
        medication_id: reminder.medication_id,
        patient_id: reminder.patient_id,
        prescription_id: reminder.prescription_id,
      },
    }));

    await step.sendEvent("send-next-medications-reminders", newEvents);
  },
);

export const sendNextMedicationsReminders = inngest.createFunction(
  { id: "send-next-medications-reminders", name: "Send Next Medications Reminders" },
  { event: "helsa/prescription.send-reminder" },
  async ({ event, step }) => {
    const { id, medication_id, patient_id, prescription_id } = event.data;
    const patient = await step.run("get-patient-info", async () => {
      const patientInfo = await new GetPatientDetails(new DrizzlePatientRepository()).execute(patient_id);
      const user = await new GetUser(new DrizzleUserRepository()).execute(patientInfo.user_id);
      return {
        ...patientInfo,
        user,
      };
    });
    const { medication, reminder } = await step.run("get-medication-info", async () => {
      const prescriptionInfo = await new GetPrescriptionDetailsSystem(new DrizzlePrescriptionRepository()).execute(
        prescription_id,
      );
      const medication = prescriptionInfo.medications?.find((med: any) => med.id === medication_id);
      const reminder = medication?.reminders?.find((rem: any) => rem.id === id);
      return {
        medication,
        reminder,
      };
    });

    await step.run("send-reminder-notification", async () => {
      const notifier = new ResendReminderNotifier();
      await notifier.notifyNextReminder(
        patient.user.email,
        medication?.name ?? "",
        reminder?.scheduled_time ? new Date(reminder.scheduled_time) : new Date(),
      );
      console.log(`Sending reminder for medication ${medication_id} to patient ${patient}`);
    });
  },
);

