import { ArchiveChat } from "@/modules/chat-agent/application/archive-chat";
import { ChatNotFound } from "@/modules/chat-agent/domain/chat-not-found";
import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseParams } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import type { NextRequest } from "next/server";
import z from "zod";

const paramsSchema = z.object({
  id: z.uuid(),
});

export const PATCH = async (_: NextRequest, ctx: RouteContext<"/api/chat/[id]/archive">) => {
  const { session } = await authenticate();
  const service = container.get(ArchiveChat);
  const { id } = await parseParams(ctx.params, paramsSchema);

  return routeHandler(
    async () => {
      await service.execute(id, session.user.id);

      return HttpNextResponse.noContent();
    },
    (error: ChatNotFound | NotAuthorized) => {
      switch (true) {
        case error instanceof ChatNotFound:
          return HttpNextResponse.domainError(error, 404);
        case error instanceof NotAuthorized:
          return HttpNextResponse.domainError(error, 403);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};

