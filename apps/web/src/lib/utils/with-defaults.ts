export function withDefaults<T extends object>(
  defaults: T,
  stored: Partial<T> | null | undefined,
): T {
  const result = { ...defaults };
  if (!stored) return result;
  for (const key of Object.keys(defaults) as Array<keyof T>) {
    const value = stored[key];
    if (value === undefined || value === null) continue;
    const fallback = defaults[key];
    result[key] =
      fallback &&
        typeof fallback === "object" &&
        !Array.isArray(fallback) &&
        typeof value === "object"
        ? ({ ...fallback, ...value } as T[keyof T])
        : (value as T[keyof T]);
  }
  return result;
}