import { getSession } from "@/modules/auth/infrastructure/helpers/get-session";
import { polar } from "@/modules/billing/infrastructure/polar-client";
import { env } from "@/modules/shared/infrastructure/env";
import { CustomerPortal } from "@polar-sh/nextjs";
import { NextRequest } from "next/server";

export const GET = CustomerPortal({
  accessToken: env.POLAR_ACCESS_TOKEN,
  getCustomerId: async (req: NextRequest) => {
    const session = await getSession();
    const customer = await polar.customers.getExternal({
      externalId: session?.user.id!,
    });
    return customer?.id;
  },
  returnUrl: env.POLAR_SUCCESS_URL,
  server: env.POLAR_MODE,
});

