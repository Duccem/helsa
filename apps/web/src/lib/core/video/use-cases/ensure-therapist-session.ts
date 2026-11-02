import type { BetterUser } from "@helsa/auth";
import { isUuid } from "@/lib/utils/is-uuid";
import { AppointmentRepository } from "../../appointment/adapters/appointment-repository";
import { assertTherapistRole } from "../../therapist/domain/guards";
import { VideoSessionNotActive, VideoSessionNotFound } from "../domain/errors";
import { EnsureVideoRoom } from "./ensure-video-room";

/** The therapist's own video appointment that can still happen, with its room. */
export class EnsureTherapistSession {
  private appointments = new AppointmentRepository();
  private rooms = new EnsureVideoRoom();

  async execute(appointment_id: string, user: BetterUser) {
    assertTherapistRole(user);

    if (!isUuid(appointment_id)) {
      throw new VideoSessionNotFound();
    }
    const appointment = await this.appointments.getById(
      appointment_id,
      user.id,
    );

    if (appointment?.modality !== "video") {
      throw new VideoSessionNotFound();
    }
    if (
      appointment.status === "cancelled" ||
      appointment.status === "no_show"
    ) {
      throw new VideoSessionNotActive();
    }

    const room = await this.rooms.execute(appointment);
    return { appointment, room };
  }
}
