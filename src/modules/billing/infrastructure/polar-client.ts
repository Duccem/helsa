import { Polar } from "@polar-sh/sdk";
import { env } from "@/modules/shared/infrastructure/env";

export const polar = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.POLAR_MODE || "sandbox", // sandbox or production
});

