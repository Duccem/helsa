import { eq } from "@helsa/db/operators";
import { user_settings } from "@helsa/db/schema/settings";
import { db } from "@/services";
import type { UserSettings } from "../domain/types";

export class SettingsRepository {
  async save(
    userId: string,
    patch: Partial<
      Pick<UserSettings, "preferences" | "notifications">
    >,
  ) {
    await db
      .insert(user_settings)
      .values({ user_id: userId, ...patch })
      .onConflictDoUpdate({ target: user_settings.user_id, set: patch });
  }

  async getSettings(user_id: string) {
    const [response] = await db
      .select()
      .from(user_settings)
      .where(eq(user_settings.user_id, user_id))
      .limit(1)

    return response;
  }
}