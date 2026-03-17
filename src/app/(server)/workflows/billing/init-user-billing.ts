import { GetUser } from "@/modules/auth/application/get-user";
import { DrizzleUserRepository } from "@/modules/auth/infrastructure/persistence/drizzle-user-repository";
import { InitializeNewUserBilling } from "@/modules/billing/application/initialize-new-user-billing";
import { PolarBillingService } from "@/modules/billing/infrastructure/polar-billing-service";
import { inngest } from "@/modules/shared/infrastructure/event-bus/inngest-client";

export const initUserBilling = inngest.createFunction(
  { id: "init-user-billing", name: "Initialize user billing on signup" },
  { event: "user.created" },
  async ({ event, step }) => {
    const { userId } = event.data;

    const userData = await step.run("fetch user data", async () => {
      const service = new GetUser(new DrizzleUserRepository());
      const user = await service.execute(userId);
      return user;
    });

    await step.run("proccess user billing", async () => {
      const service = new InitializeNewUserBilling(new PolarBillingService());
      await service.execute({
        id: userData.id,
        name: userData.name,
        email: userData.email,
      });
    });

    return { success: true };
  },
);

