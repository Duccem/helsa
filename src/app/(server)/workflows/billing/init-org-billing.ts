import { GetOrganization } from "@/modules/auth/application/get-organization";
import { DrizzleOrganizationRepository } from "@/modules/auth/infrastructure/persistence/drizzle-organization-repository";
import { InitializeNewOrganizationBilling } from "@/modules/billing/application/initialize-new-organization-billing";
import { PolarBillingService } from "@/modules/billing/infrastructure/polar-billing-service";
import { inngest } from "@/modules/shared/infrastructure/event-bus/inngest-client";

export const initUserBilling = inngest.createFunction(
  { id: "init-organization-billing", name: "Initialize user billing on signup" },
  { event: "organization.created" },
  async ({ event, step }) => {
    const { organizationId } = event.data;

    const orgData = await step.run("fetch user data", async () => {
      const service = new GetOrganization(new DrizzleOrganizationRepository());
      const organization = await service.execute(organizationId);
      return organization;
    });

    await step.run("proccess user billing", async () => {
      const service = new InitializeNewOrganizationBilling(new PolarBillingService());
      await service.execute({
        id: orgData.id,
        name: orgData.name,
        email: `${orgData.name.replace(/\s+/g, "").toLowerCase()}@example.com`,
      });
    });

    return { success: true };
  },
);

