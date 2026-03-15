import { ChangeRole } from "@/modules/auth/application/change-role";
import { InvalidRole } from "@/modules/auth/domain/invalid-role";
import { UserNotFound } from "@/modules/auth/domain/user-not-found";
import { DrizzleUserRepository } from "@/modules/auth/infrastructure/persistence/drizzle-user-repository";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { parseBody } from "@/modules/shared/infrastructure/http/http-parsers";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";
import z from "zod";

const changeRoleSchema = z.object({
  role: z.enum(["patient", "doctor", "admin"]),
});

export const POST = async (request: NextRequest) => {
  const { session } = await authenticate();
  const { role } = await parseBody(request, changeRoleSchema);
  const service = new ChangeRole(new DrizzleUserRepository());

  return routeHandler(
    async () => {
      await service.execute(session.user.id, role);
      return HttpNextResponse.noContent();
    },
    (error: UserNotFound | InvalidRole) => {
      switch (true) {
        case error instanceof UserNotFound:
          return HttpNextResponse.domainError(error, 404);
        case error instanceof InvalidRole:
          return HttpNextResponse.domainError(error, 400);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};

