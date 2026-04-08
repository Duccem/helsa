import { GetUser } from "@/modules/auth/application/get-user";
import { InitializeNewUserBilling } from "@/modules/billing/application/initialize-new-user-billing";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { inngest } from "@/modules/shared/infrastructure/event-bus/inngest-client";

export const initUserBilling = inngest.createFunction(
  { id: "init-user-billing", name: "Initialize user billing on signup" },
  { event: "user.created" },
  async ({ event, step }) => {
    const { userId } = event.data;

    const userData = await step.run("fetch user data", async () => {
      const service = container.get(GetUser);
      const user = await service.execute(userId);
      return user;
    });

    await step.run("proccess user billing", async () => {
      const service = container.get(InitializeNewUserBilling);
      await service.execute({
        id: userData.id,
        name: userData.name,
        email: userData.email,
      });
    });

    return { success: true };
  },
);
