import { GetSubscriptionStatus } from "@/modules/billing/application/get-subscription-status";
import { PolarBillingService } from "@/modules/billing/infrastructure/polar-billing-service";
import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { authenticate, authenticateOrg } from "@/modules/shared/infrastructure/http/http-authenticate";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";

const service = new GetSubscriptionStatus(new PolarBillingService());

export const GET = async (_req: NextRequest) => {
  const { session } = await authenticate();
  let id = session.user.id;

  if (session.user.role == "admin") {
    const organization = await authenticateOrg();
    id = organization.id;
  }

  return routeHandler(
    async () => {
      const status = await service.execute({ id });

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

