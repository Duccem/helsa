import type { NextRequest } from "next/server";
import z from "zod";
import { NotAuthorized } from "@/modules/shared/domain/errors/not-authorized";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseParams } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { GeneratePatientVideoCallToken } from "@/modules/video-call/application/generate-patient-video-call-token";
import { VideoCallNotFound } from "@/modules/video-call/domain/video-call-not-found";
import { VideoCallParticipantNotFound } from "@/modules/video-call/domain/video-call-participant-not-found";
import { JwtVideoCallAuthService } from "@/modules/video-call/infrastructure/jwt-video-call-auth-service";
import { DrizzleVideoCallRepository } from "@/modules/video-call/infrastructure/persistence/drizzle-video-call-repository";

const paramsSchema = z.object({
  appointmentId: z.uuid(),
});

export const GET = async (_: NextRequest, ctx: RouteContext<"/api/video-call/[appointmentId]/patient-token">) => {
  await authenticate();
  const service = new GeneratePatientVideoCallToken(new DrizzleVideoCallRepository(), new JwtVideoCallAuthService());
  const { appointmentId } = await parseParams(ctx.params, paramsSchema);

  return routeHandler(
    async () => {
      const token = await service.execute(appointmentId);

      return HttpNextResponse.json({ token });
    },
    (error: VideoCallNotFound | VideoCallParticipantNotFound | NotAuthorized) => {
      switch (true) {
        case error instanceof VideoCallNotFound:
          return HttpNextResponse.domainError(error, 404);
        case error instanceof VideoCallParticipantNotFound:
          return HttpNextResponse.domainError(error, 404);
        case error instanceof NotAuthorized:
          return HttpNextResponse.domainError(error, 403);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};
