import type { BetterUser } from "@helsa/auth";
import type { Session } from "better-auth";
import { headers } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { auth } from "@/services";
import { withError } from "../api/server";
import { AuthError, type CommonError } from "../utils/error";

export type AuthContext = {
  session: Session;
  user: BetterUser;
};
export const withAuth = <T = any>(
  closure: (
    req: NextRequest,
    params: Promise<T>,
    context: AuthContext,
  ) => Promise<NextResponse>,
  errorHandler?: (error: CommonError) => NextResponse,
) => {
  return withError(async (req: NextRequest, params: Promise<T>) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      throw new AuthError();
    }
    return closure(req, params, session);
  }, errorHandler);
};