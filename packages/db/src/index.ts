import { drizzle } from "drizzle-orm/postgres-js";
import postgres from 'postgres';

import type { DatabaseConfig } from "./config";
import { relations } from "./relations";

export function createDb(env: DatabaseConfig) {
  const sql = postgres(env.DATABASE_URL, { prepare: false });
  return drizzle({ client: sql, relations });
}

export type Database = ReturnType<typeof createDb>;
