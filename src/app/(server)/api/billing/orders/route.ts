import { GetOrderList } from "@/modules/billing/application/get-order-list";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { authenticate, authenticateOrg } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseQuery } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";
import z from "zod";

const paramsSchema = z.object({
  page: z.coerce.number().optional(),
});

export const GET = async (req: NextRequest) => {
  const { session } = await authenticate();
  let id = session.user.id;

  if (session.user.role == "admin") {
    const organization = await authenticateOrg();
    id = organization.id;
  }
  const { page } = parseQuery(req, paramsSchema);

  return routeHandler(
    async () => {
      const service = container.get(GetOrderList);
      const orders = await service.execute(id, page);

      return HttpNextResponse.json(orders);
    },
    (error) => {
      return HttpNextResponse.internalServerError();
    },
  );
};

