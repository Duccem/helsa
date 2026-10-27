import type { BetterUser } from "@helsa/auth";
import { TherapistRepository } from "../adapters/therapist-repository";
import { TherapistNotFound } from "../domain/errors";

export class RemoveTimeOff {
  private repository = new TherapistRepository();

  async execute(id: string, user: BetterUser) {
    const therapist = await this.repository.getById(user.id);

    if (!therapist) {
      throw new TherapistNotFound();
    }

    await this.repository.deleteTimeOff(id, user.id);
  }
}