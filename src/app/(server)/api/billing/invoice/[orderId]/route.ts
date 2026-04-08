import { GetOrGenerateInvoice } from "@/modules/billing/application/get-or-generate-invoice";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseParams } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";
import z from "zod";

const paramsSchema = z.object({
  orderId: z.string(),
});

export const GET = async (_req: NextRequest, ctx: RouteContext<"/api/billing/invoice/[orderId]">) => {
  await authenticate();
  const { orderId } = await parseParams(ctx.params, paramsSchema);

  return routeHandler(
    async () => {
      const service = container.get(GetOrGenerateInvoice);
      const state = await service.execute(orderId);

      return HttpNextResponse.json(state);
    },
    (error) => {
      return HttpNextResponse.internalServerError();
    },
  );
};

export const POST = async (_req: NextRequest, ctx: RouteContext<"/api/billing/invoice/[orderId]">) => {
  await authenticate();
  const { orderId } = await parseParams(ctx.params, paramsSchema);

  return routeHandler(
    async () => {
      const service = container.get(GetOrGenerateInvoice);
      const state = await service.execute(orderId);

      return HttpNextResponse.json(state);
    },
    (error) => {
      return HttpNextResponse.internalServerError();
    },
  );
};

