import { NextResponse } from "next/server";

/** Every API route answers `{ ok: true, ...data }` or `{ ok: false, error }`. */
export function ok<T extends object>(data?: T) {
	return NextResponse.json({ ok: true, ...data });
}

export function fail(error: string, status: number) {
	return NextResponse.json({ ok: false, error }, { status });
}

/** Reads the JSON body, returning `undefined` when it is missing or malformed. */
export async function readJson(request: Request): Promise<unknown> {
	try {
		return await request.json();
	} catch {
		return undefined;
	}
}
