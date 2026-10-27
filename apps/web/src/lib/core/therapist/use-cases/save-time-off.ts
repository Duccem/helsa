import type { BetterUser } from "@helsa/auth";
import { addDays, startOfZonedDay } from "@/lib/utils/zoned-time";
import { TherapistRepository } from "../adapters/therapist-repository";
import { TherapistNotFound } from "../domain/errors";
import { EnsureTherapist } from "./ensure-therapist";

type SaveTimeOffInput = {
  startsOn: string;
  endsOn: string;
  reason: string | null;
}
export class SaveTimeOff {
  private repository = new TherapistRepository();
  private ensurer = new EnsureTherapist();

  async execute(data: SaveTimeOffInput, user: BetterUser) {
    await this.ensurer.execute(user);

    const therapist = await this.repository.getById(user.id);

    if (!therapist) {
      throw new TherapistNotFound();
    }

    const timezone = therapist.timezone ?? "America/Caracas";
    const startsAt = startOfZonedDay(data.startsOn, timezone);
    // Stored as the midnight after the last day off.
    const endsAt = startOfZonedDay(addDays(data.endsOn, 1), timezone);

    await this.repository.saveTimeOff({ starts_at: startsAt, ends_at: endsAt, reason: data.reason ?? "" }, user.id);

  }
}