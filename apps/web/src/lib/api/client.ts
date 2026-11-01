/** Error thrown by `apiFetch`; `message` is already safe to show to the user. */
export class ApiError extends Error {
	constructor(
		message: string,
		readonly status: number,
	) {
		super(message);
		this.name = "ApiError";
	}
}

const FALLBACK = "Algo salió mal. Intenta de nuevo.";

/** Calls one of our `/api` routes and throws `ApiError` when it fails. */
export async function apiFetch<T = void>(
	path: string,
	init?: Omit<RequestInit, "body"> & { body?: unknown },
): Promise<T> {
	const { body, headers, ...rest } = init ?? {};
	let response: Response;
	try {
		response = await fetch(path, {
			...rest,
			headers: {
				...(body === undefined ? {} : { "Content-Type": "application/json" }),
				...headers,
			},
			body: body === undefined ? undefined : JSON.stringify(body),
		});
	} catch {
		throw new ApiError("Revisa tu conexión e intenta de nuevo.", 0);
	}

	const data = await response.json().catch(() => null);
	if (!response.ok || data?.ok === false) {
		throw new ApiError(
			data?.error ?? data?.message ?? FALLBACK,
			response.status,
		);
	}
	return data as T;
}
