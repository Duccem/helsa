import { ZodType } from "zod";
import { NextRequest } from "next/server";

export async function parseBody<T>(req: NextRequest, schema: ZodType<T>) {
  if (req.method === "GET" || req.method === "HEAD") {
    return {} as T;
  }

  if (!schema) {
    return (await req.json()) as T;
  }

  return schema.parse(await req.json());
}

export async function parseParams<R>(params: Promise<R>, schema?: ZodType<R>): Promise<R> {
  const resolvedParams = await params;
  if (!schema) {
    return resolvedParams;
  }
  return schema.parse(resolvedParams);
}

export async function parseQuery<R>(req: NextRequest, schema?: ZodType<R>): Promise<R> {
  const queryParams = Object.fromEntries(req.nextUrl.searchParams.entries()) as unknown as R;
  if (!schema) {
    return queryParams as R;
  }
  return schema.parse(queryParams);
}

