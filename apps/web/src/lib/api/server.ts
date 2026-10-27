import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { useLogger, withEvlog } from "../evlog";
import { AuthError, CommonError } from "../utils/error";

/** Every API route answers `{ ok: true, ...data }` or `{ ok: false, error }`. */
export function ok<T extends object>(_data?: T) {
	return new NextResponse(null, { status: 200 });
}

export function created() {
	return NextResponse.json({ message: "saved" }, { status: 201 })
}

export function fail(error: string, status: number) {
	return NextResponse.json({ ok: false, error }, { status });
}

export function domainError(error: CommonError, code: number) {
	return NextResponse.json(
		{
			message: error.message,
		},
		{ status: code },
	);
}

export function internalServerError() {
	return NextResponse.json(
		{
			code: "InternalServerError",
			message: "Internal server error",
			data: {},
		},
		{ status: 500 },
	);
}

export function noResponse() {
	return new NextResponse(null, { status: 204 });
}

export function json<JsonBody>(data: JsonBody): NextResponse {
	return NextResponse.json(data, { status: 200 });
}

/** Reads the JSON body, returning `undefined` when it is missing or malformed. */
export async function readJson(request: Request): Promise<unknown> {
	try {
		return await request.json();
	} catch {
		return undefined;
	}
}

export const withError = <T = any>(
	closure: (req: NextRequest, params: Promise<T>) => Promise<NextResponse>,
	errorHandler?: (error: CommonError) => NextResponse,
) => {
	return withEvlog(
		async (req: NextRequest, { params }: { params: Promise<T> }) => {
			const log = useLogger();
			try {
				return closure(req, params);
			} catch (error) {
				log.error(error as Error);
				switch (true) {
					case error instanceof ZodError:
						return fail("Parameters error", 400);
					case error instanceof AuthError:
						return domainError(error, 401);
					case error instanceof CommonError: {
						const response = errorHandler?.(error);
						if (response) return response;
						return internalServerError();
					}
					default:
						return internalServerError();
				}
			}
		},
	);
};