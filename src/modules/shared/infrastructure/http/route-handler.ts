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
      const response = onError(error as T);

      if (response) {
        return response;
      }
    }

    return HttpNextResponse.internalServerError();
  }
}

