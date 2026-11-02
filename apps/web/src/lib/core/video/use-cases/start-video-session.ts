import type { BetterUser } from "@helsa/auth";
import { VideoRepository } from "../adapters/video-repository";
import { EnsureTherapistSession } from "./ensure-therapist-session";

/** Called when the patient appears in the call: the session has really started. */
export class StartVideoSession {
  private repository = new VideoRepository();
  private ensurer = new EnsureTherapistSession();

  async execute(appointment_id: string, user: BetterUser) {
    const { room } = await this.ensurer.execute(appointment_id, user);

    if (room.started_at || room.ended_at) return;

    const now = new Date();
    await this.repository.update({ ...room, started_at: now });
    await this.repository.addEvent({
      room_id: room.id,
      role: "patient",
      event_type: "join",
      occurred_at: now,
    });
  }
}
