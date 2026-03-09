import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as auth from "@/modules/auth/infrastructure/persistence/auth.schema";
const sql = neon(process.env.DATABASE_URL!);
export const database = drizzle({ client: sql, schema: { ...auth } });
