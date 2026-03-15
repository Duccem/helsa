import { ChangeRole } from "@/modules/auth/application/change-role";
import { DrizzleUserRepository } from "@/modules/auth/infrastructure/persistence/drizzle-user-repository";
import { medicalProducts, patientProducts } from "@/modules/billing/infrastructure/polar-products";
import { env } from "@/modules/shared/infrastructure/env";
import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
  webhookSecret: env.POLAR_WEBHOOK_SECRET!,
  onSubscriptionActive: async (subscription) => {
    const service = new ChangeRole(new DrizzleUserRepository());
    const isFreeDoctor = medicalProducts.find((product) => product.id === subscription.data.productId);
    const isPatient = patientProducts.some((product) => product.id === subscription.data.productId);

    if (isFreeDoctor) {
      await service.execute(subscription.data.metadata.user_id as string, "doctor");
    } else if (!isPatient) {
      await service.execute(subscription.data.metadata.user_id as string, "admin");
    }
  },
  onSubscriptionCanceled: async (subscription) => {
    const service = new ChangeRole(new DrizzleUserRepository());
    const isMedical = medicalProducts.some((product) => product.id === subscription.data.productId);

    if (isMedical) {
      await service.execute(subscription.data.metadata.user_id as string, "doctor");
    }
  },
  onSubscriptionRevoked: async (subscription) => {
    const service = new ChangeRole(new DrizzleUserRepository());
    const isMedical = medicalProducts.some((product) => product.id === subscription.data.productId);

    if (isMedical) {
      await service.execute(subscription.data.metadata.user_id as string, "doctor");
    }
  },
});

