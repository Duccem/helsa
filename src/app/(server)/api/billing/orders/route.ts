import { GetOrderList } from "@/modules/billing/application/get-order-list";
import { PolarBillingService } from "@/modules/billing/infrastructure/polar-billing-service";
import { authenticate, authenticateOrg } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseQuery } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";
import z from "zod";

const service = new GetOrderList(new PolarBillingService());

const paramsSchema = z.object({
  page: z.coerce.number().optional(),
});

export const GET = async (req: NextRequest) => {
  await authenticate();
  const organization = await authenticateOrg();
  const { page } = parseQuery(req, paramsSchema);

  return routeHandler(
    async () => {
      const orders = await service.execute(organization.id, page);

      return HttpNextResponse.json(orders);
    },
    (error) => {
      return HttpNextResponse.internalServerError();
    },
  );
};

