import type { BetterUser } from "@helsa/auth";
import { ENV } from "@/env.server";
import { guestKey } from "@/lib/infra/jitsi";
import { EnsureTherapistSession } from "./ensure-therapist-session";

/** The link the therapist sends to the patient. It works without an account. */
export class LoadGuestLink {
  private ensurer = new EnsureTherapistSession();

  async execute(appointment_id: string, user: BetterUser) {
    const { appointment, room } = await this.ensurer.execute(
      appointment_id,
      user,
    );
    const url = new URL(`/s/${appointment.id}`, ENV.BETTER_AUTH_URL);
    url.searchParams.set("k", guestKey(room.id));

    return { url: url.toString() };
  }
}
