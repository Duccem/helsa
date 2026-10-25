/** Keeps a `redirect` query value only when it points inside Helsa. */
export function safeRedirect(value: unknown): string | undefined {
	if (typeof value !== "string") return undefined;
	if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\"))
		return undefined;
	return value;
}
