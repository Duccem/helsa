import { GetSubscriptionStatus } from "@/modules/billing/application/get-subscription-status";
import { PolarBillingService } from "@/modules/billing/infrastructure/polar-billing-service";
import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { authenticate, authenticateOrg } from "@/modules/shared/infrastructure/http/http-authenticate";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";

const service = new GetSubscriptionStatus(new PolarBillingService());

export const GET = async (_req: NextRequest) => {
  await authenticate();
  const organization = await authenticateOrg();

  return routeHandler(
    async () => {
      const status = await service.execute(organization);

      return HttpNextResponse.json(status);
    },
    (error) => {
      if (error instanceof NotAuthorized) {
        return HttpNextResponse.domainError(error, 401);
      }
      return HttpNextResponse.internalServerError();
    },
  );
};

