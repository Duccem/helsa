import { ChangeRole } from "@/modules/auth/application/change-role";
import { DrizzleUserRepository } from "@/modules/auth/infrastructure/persistence/drizzle-user-repository";
import { medicalProducts, patientProducts } from "@/modules/billing/infrastructure/polar-products";
import { env } from "@/modules/shared/infrastructure/env";
import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
  webhookSecret: env.POLAR_WEBHOOK_SECRET!,
});

