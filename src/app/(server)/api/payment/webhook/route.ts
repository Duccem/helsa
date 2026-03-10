import { env } from "@/modules/shared/infrastructure/env";
import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
  webhookSecret: env.POLAR_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    // Handle the payload
    // No need to return an acknowledge response
  },
});

