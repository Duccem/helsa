import { randomUUID } from "node:crypto";
import { guestKey, hashGuestKey, newRoomName } from "@/lib/infra/jitsi";
import { VideoRepository } from "../adapters/video-repository";
import { roomWindow } from "../domain/window";

type EnsureVideoRoomInput = { id: string; starts_at: Date; ends_at: Date };

/** The appointment's room, created on first use and kept in step with its time. */
export class EnsureVideoRoom {
  private repository = new VideoRepository();

  async execute(appointment: EnsureVideoRoomInput) {
    const window = roomWindow(appointment.starts_at, appointment.ends_at);
    const existing = await this.repository.getByAppointment(appointment.id);

    if (!existing) {
      await this.repository.create(this.newRoomData(appointment.id, window));
      const created = await this.repository.getByAppointment(appointment.id);
      if (!created) throw new Error("The video room was not saved");
      return created;
    }

    // The appointment was moved: follow its new time.
    if (
      existing.opens_at.getTime() !== window.opens_at.getTime() ||
      existing.closes_at.getTime() !== window.closes_at.getTime()
    ) {
      const updated = { ...existing, ...window };
      await this.repository.update(updated);
      return updated;
    }

    return existing;
  }

  private newRoomData(
    appointment_id: string,
    window: ReturnType<typeof roomWindow>,
  ) {
    const id = randomUUID();
    return {
      id,
      appointment_id,
      provider: "jitsi" as const,
      room_name: newRoomName(),
      patient_join_token_hash: hashGuestKey(guestKey(id)),
      ...window,
    };
  }
}
