import { GetUser } from "@/modules/auth/application/get-user";
import { DrizzleUserRepository } from "@/modules/auth/infrastructure/persistence/drizzle-user-repository";
import { CreatePatient } from "@/modules/patient/application/create-patient";
import { DrizzlePatientRepository } from "@/modules/patient/infrastructure/persistence/drizzle-patient-repository";
import { inngest } from "@/modules/shared/infrastructure/event-bus/inngest-client";

export const createPatient = inngest.createFunction(
  { name: "Create Patient Workflow", id: "create-patient" },
  { event: "user.role.set_as_patient" },
  async ({ event, step }) => {
    const { userId } = event.data.attributes;

    const user = await step.run("get_user", async () => {
      const getUser = new GetUser(new DrizzleUserRepository());
      return await getUser.execute(userId);
    });

    await step.run("create_patient_profile", async () => {
      const creator = new CreatePatient(new DrizzlePatientRepository());
      await creator.execute({
        user_id: userId,
        email: user.email,
        name: user.name,
        birth_date: new Date(), // Placeholder, replace with actual birth date if available
      });
    });
  },
);

