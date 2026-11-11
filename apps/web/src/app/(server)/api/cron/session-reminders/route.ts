import { timingSafeEqual } from "node:crypto";
import { ENV } from "@/env.server";
import { SendDueSessionReminders } from "@/lib/core/appointment/use-cases/send-due-session-reminders";

export const maxDuration = 60;

const sendReminders = new SendDueSessionReminders();

/** Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. */
function authorized(request: Request) {
	const secret = ENV.CRON_SECRET;
	if (!secret) return false;
	const given = Buffer.from(request.headers.get("authorization") ?? "");
	const expected = Buffer.from(`Bearer ${secret}`);
	return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Sends the session reminders that are due. Runs every 15 minutes (vercel.json). */
export async function GET(request: Request) {
	if (!authorized(request)) {
		return Response.json({ ok: false }, { status: 401 });
	}

	const summary = await sendReminders.execute();
	return Response.json({ ok: true, ...summary });
}
