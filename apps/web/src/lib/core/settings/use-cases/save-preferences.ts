import type { BetterUser } from "@helsa/auth";
import { SettingsRepository } from "../adapters/settings-repository";

type SavePreferencesInput = {
  timeFormat: "24h" | "12h";
  weekStartsOn: 0 | 6;
  currencyDisplay: "usd" | "ves" | "both";
  privateMode: boolean;
}

export class SavePreferences {
  private repository = new SettingsRepository();

  async execute(data: SavePreferencesInput, user: BetterUser) {
    await this.repository.save(user.id, { preferences: data });
  }
}