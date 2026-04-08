import { GetDoctorPatients } from "@/modules/doctor/application/get-doctor-patients";
import { DoctorNotFound } from "@/modules/doctor/domain/doctor-not-found";
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";
import { authenticate } from "@/modules/shared/infrastructure/http/http-authenticate";
import { HttpNextResponse } from "@/modules/shared/infrastructure/http/next-http-response";
import { routeHandler } from "@/modules/shared/infrastructure/http/route-handler";
import { NextRequest } from "next/server";

export const GET = async (_req: NextRequest) => {
  const { session } = await authenticate();

  return routeHandler(
    async () => {
      const service = container.get(GetDoctorPatients);
      const patients = await service.execute(session.user.id);
      return HttpNextResponse.json({ patients });
    },
    (error: unknown) => {
      switch (true) {
        case error instanceof DoctorNotFound:
          return HttpNextResponse.domainError(error, 404);
        default:
          return HttpNextResponse.internalServerError();
      }
    },
  );
};

