import { eq } from "@helsa/db/operators";
import { video_participant_event, video_room } from "@helsa/db/schema/video";
import { db } from "@/services";
import type { NewVideoEvent, NewVideoRoom, VideoRoom } from "../domain/types";

export class VideoRepository {
  async getByAppointment(appointment_id: string) {
    const [response] = await db
      .select()
      .from(video_room)
      .where(eq(video_room.appointment_id, appointment_id))
      .limit(1);

    return response;
  }

  /** Inserts the room unless the appointment already has one. */
  async create(data: NewVideoRoom) {
    await db
      .insert(video_room)
      .values(data)
      .onConflictDoNothing({ target: video_room.appointment_id });
  }

  async update(data: VideoRoom) {
    await db.update(video_room).set(data).where(eq(video_room.id, data.id));
  }

  async addEvent(data: NewVideoEvent) {
    await db.insert(video_participant_event).values(data);
  }
}
