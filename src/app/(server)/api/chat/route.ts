import { GetActiveChat } from "@/modules/chat-agent/application/get-active-chat";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import type { NextRequest } from "next/server";

export const GET = async (_: NextRequest) => {
  const { session } = await authenticate();
  const service = container.get(GetActiveChat);

  return routeHandler(
    async () => {
      const chat = await service.execute(session.user.id);

      return HttpNextResponse.json(chat);
    },
    (_error: unknown) => {
      return HttpNextResponse.internalServerError();
    },
  );
};

