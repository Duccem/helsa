import type { NextRequest } from "next/server";
import { preferencesSchema } from "@/components/dashboard/settings/schema";
import { ok, readJson } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { SavePreferences } from "@/lib/core/settings/use-cases/save-preferences";

const savePreferences = new SavePreferences();

export const PUT = withAuth(async (request: NextRequest, _, ctx: AuthContext) => {
	const parsed = preferencesSchema.parse(await readJson(request));

	await savePreferences.execute(parsed, ctx.user);
	return ok();
})

