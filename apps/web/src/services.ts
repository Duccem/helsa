import { createAuth } from "@helsa/auth";
import { createDb } from "@helsa/db";
import { createMailer } from "@helsa/email";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
export const mailer = createMailer({
	RESEND_API_KEY: ENV.RESEND_API_KEY,
	EMAIL_FROM: ENV.EMAIL_FROM,
	BASE_URL: ENV.BETTER_AUTH_URL,
});
