import type { BetterUser } from "@helsa/auth";
import { AppointmentRepository } from "../../appointment/adapters/appointment-repository";
import { VideoRepository } from "../adapters/video-repository";
import type { VideoRoom } from "../domain/types";
import { EnsureTherapistSession } from "./ensure-therapist-session";

/**
 * The therapist ends the call for everyone and the appointment is completed.
 * Before the patient ever joined nothing is closed, so the room stays usable.
 */
export class EndVideoSession {
  private repository = new VideoRepository();
  private appointments = new AppointmentRepository();
  private ensurer = new EnsureTherapistSession();

  async execute(appointment_id: string, user: BetterUser) {
    const { room } = await this.ensurer.execute(appointment_id, user);

    if (room.ended_at || !room.started_at)
      return { completed: Boolean(room.ended_at) };

    const now = new Date();
    await this.repository.update(
      this.endedRoomData(room, room.started_at, now),
    );
    await this.repository.addEvent({
      room_id: room.id,
      role: "therapist",
      event_type: "end",
      occurred_at: now,
    });
    await this.appointments.markCompleted(appointment_id, user.id, now);

    return { completed: true };
  }

  private endedRoomData(room: VideoRoom, started_at: Date, now: Date) {
    return {
      ...room,
      ended_at: now,
      duration_seconds: Math.round(
        (now.getTime() - started_at.getTime()) / 1000,
      ),
    };
  }
}
