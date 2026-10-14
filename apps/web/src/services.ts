import { createAuth } from "@helsa/auth";
import { createDb } from "@helsa/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
