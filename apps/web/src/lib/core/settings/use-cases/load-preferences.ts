import { withDefaults } from "@/lib/utils/with-defaults";
import { SettingsRepository } from "../adapters/settings-repository";

export const defaultPreferences = {
  timeFormat: "24h",
  weekStartsOn: 0,
  currencyDisplay: "both",
  privateMode: false,
};

export class LoadPreferences {
  private repository = new SettingsRepository();

  async execute(user_id: string) {
    const row = await this.repository.getSettings(user_id);

    return withDefaults(defaultPreferences, row.preferences);
  }
}