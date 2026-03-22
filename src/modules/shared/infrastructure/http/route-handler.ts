import { NextResponse } from "next/server";
import { DomainError } from "../../domain/domain-error";
import { HttpNextResponse } from "./next-http-response";

export async function routeHandler<T extends DomainError>(
  fn: () => Promise<NextResponse>,
  onError: (error: T) => NextResponse | void = () => undefined,
) {
  try {
    return await fn();
  } catch (error: unknown) {
    if (error instanceof DomainError) {
      console.error("Domain error:", error.toPrimitives());
      const response = onError(error as T);

      if (response) {
        return response;
      }
    }

    console.error("Unexpected error:", error);

    return HttpNextResponse.internalServerError();
  }
}

