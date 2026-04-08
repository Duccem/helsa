import { ListSpecialties } from "@/modules/doctor/application/list-specialties";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseQuery } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";
import z from "zod";

const searchSpecialtySchema = z.object({
  name: z.string().optional(),
});

export const GET = async (request: NextRequest) => {
  await authenticate();
  const query = parseQuery(request, searchSpecialtySchema);
  const service = container.get(ListSpecialties);

  return routeHandler(
    async () => {
      const result = await service.execute(query.name);
      return HttpNextResponse.json(result);
    },
    (_error: unknown) => {
      return HttpNextResponse.internalServerError();
    },
  );
};

