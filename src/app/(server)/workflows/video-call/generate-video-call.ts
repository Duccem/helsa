import { inngest } from "@/modules/shared/infrastructure/event-bus/inngest-client";
import { CreateVideoCallForAppointment } from "@/modules/video-call/application/create-video-call-for-appointment";
import { DrizzleVideoCallRepository } from "@/modules/video-call/infrastructure/persistence/drizzle-video-call-repository";

export const generateVideoCall = inngest.createFunction(
  { name: "Generate video call for appointment", id: "generate-video-call-for-appointment" },
  { event: "appointment.scheduled" },
  async ({ event, step }) => {
    const { appointment_id, mode } = event.data;

    if (mode !== "ONLINE") {
      return {
        message: `Appointment with ID ${appointment_id} is not online, skipping video call generation`,
      };
    }

    await step.run("create-video-call-for-appointment", async () => {
      const service = new CreateVideoCallForAppointment(new DrizzleVideoCallRepository());
      await service.execute(appointment_id);
    });
  },
);
