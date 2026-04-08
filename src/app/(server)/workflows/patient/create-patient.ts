import { GetUser } from "@/modules/auth/application/get-user";
import { CreatePatient } from "@/modules/patient/application/create-patient";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { inngest } from "@/modules/shared/infrastructure/event-bus/inngest-client";

export const createPatient = inngest.createFunction(
  { name: "Create Patient Workflow", id: "create-patient" },
  { event: "user.role.set_as_patient" },
  async ({ event, step }) => {
    const { userId } = event.data.attributes;

    const user = await step.run("get_user", async () => {
      const getUser = container.get(GetUser);
      return await getUser.execute(userId);
    });

    await step.run("create_patient_profile", async () => {
      const creator = container.get(CreatePatient);
      await creator.execute({
        user_id: userId,
        email: user.email,
        name: user.name,
        birth_date: new Date(), // Placeholder, replace with actual birth date if available
      });
    });
  },
);
