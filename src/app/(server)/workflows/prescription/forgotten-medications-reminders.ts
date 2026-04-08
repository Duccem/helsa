import { GetUser } from "@/modules/auth/application/get-user";
import { GetPatientDetails } from "@/modules/patient/application/get-patient-details";
import { GetPrescriptionDetailsSystem } from "@/modules/prescription/application/get-prescription-details-system";
import { SearchReminders } from "@/modules/prescription/application/search-reminders";
import { ReminderNotifier } from "@/modules/prescription/domain/reminder-notifier";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { inngest } from "@/modules/shared/infrastructure/event-bus/inngest-client";
import { subHours } from "date-fns";

export const forgottenMedicationsReminders = inngest.createFunction(
  { id: "forgotten-medications-reminders", name: "Forgotten Medications Reminders" },
  { cron: "TZ=America/Caracas 0 * * * *" },
  async ({ step }) => {
    const inLastHour = subHours(new Date(), 1);
    const reminders = await step.run("get-forgotten-medications-reminders", async () => {
      const service = container.get(SearchReminders);
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

export const sendForgottenMedicationsReminders = inngest.createFunction(
  { id: "send-forgotten-medications-reminders", name: "Send Forgotten Medications Reminders" },
  { event: "helsa/prescription.send-forgotten-reminder" },
  async ({ event, step }) => {
    const { id, medication_id, patient_id, prescription_id } = event.data;
    const patient = await step.run("get-patient-info", async () => {
      const patientInfo = await container.get(GetPatientDetails).execute(patient_id);
      const user = await container.get(GetUser).execute(patientInfo.user_id);
      return {
        ...patientInfo,
        user,
      };
    });
    const { medication, reminder } = await step.run("get-medication-info", async () => {
      const prescriptionInfo = await container.get(GetPrescriptionDetailsSystem).execute(prescription_id);
      const medication = prescriptionInfo.medications?.find((med: any) => med.id === medication_id);
      const reminder = medication?.reminders?.find((rem: any) => rem.id === id);
      return {
        medication,
        reminder,
      };
    });

    await step.run("send-reminder-notification", async () => {
      const notifier = container.get(ReminderNotifier);
      await notifier.notifyMissedReminder(
        patient.user.email,
        medication?.name ?? "",
        reminder?.scheduled_time ? new Date(reminder.scheduled_time) : new Date(),
      );
    });
  },
);
