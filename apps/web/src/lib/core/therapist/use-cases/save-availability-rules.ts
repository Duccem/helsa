import type { BetterUser } from "@helsa/auth";
import { toDbWeekday } from "@/lib/utils/transformers";
import { TherapistRepository } from "../adapters/therapist-repository";
import { TherapistNotFound } from "../domain/errors";
import type { Therapist } from "../domain/types";
import { EnsureTherapist } from "./ensure-therapist";

type SaveAvailabilityRulesInput = {
  timezone: string;
  sessionMinutes: number;
  bufferMinutes: number;
  ranges: {
    id: string;
    weekday: number;
    start: string;
    end: string;
    modality: "video" | "in_person" | "phone" | null;
  }[]
}

export class SaveAvailabilityRules {
  private repository = new TherapistRepository();
  private ensurer = new EnsureTherapist();

  async execute(data: SaveAvailabilityRulesInput, user: BetterUser) {
    await this.ensurer.execute(user);
    const therapist = await this.repository.getById(user.id);

    if (!therapist) {
      throw new TherapistNotFound();
    }

    const updatedTherapist = this.updateTherapist(data, therapist);

    await this.repository.update(updatedTherapist);

    const ranges = data.ranges.map((range) => ({
      therapist_id: user.id,
      id: range.id,
      weekday: toDbWeekday(range.weekday),
      start_time: `${range.start}:00`,
      end_time: `${range.end}:00`,
      modality: range.modality,
      created_at: new Date(),
    }))

    await this.repository.saveRules(ranges, user.id)
  }

  private updateTherapist(data: SaveAvailabilityRulesInput, therapist: Therapist) {
    return {
      ...therapist,
      timezone: data.timezone,
      default_session_minutes: data.sessionMinutes,
      default_buffer_minutes: data.bufferMinutes,
    }
  }
}