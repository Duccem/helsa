import { TherapistRepository } from "../adapters/therapist-repository";

/** The therapist's public booking link, for the sidebar. */
export class LoadBookingLink {
  private repository = new TherapistRepository();

  async execute(user_id: string) {
    const therapist = await this.repository.getById(user_id);

    return {
      slug: therapist?.booking_slug ?? null,
      enabled: Boolean(therapist?.booking_enabled && therapist.booking_slug),
    };
  }
}
