const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Ids come from the URL; anything that is not a UUID can't exist (and would make Postgres throw). */
export function isUuid(value: string) {
  return UUID.test(value);
}
