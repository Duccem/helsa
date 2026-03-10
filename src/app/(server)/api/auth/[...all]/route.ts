import { auth } from "@/modules/auth/infrastructure/auth-server";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);

