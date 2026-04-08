import { VideoCall, VideoCallAppointmentId, VideoCallId } from "./video-call";

export abstract class VideoCallRepository {
  abstract create(videoCall: VideoCall): Promise<void>;
  abstract findById(id: VideoCallId): Promise<VideoCall | null>;
  abstract findByAppointmentId(appointmentId: VideoCallAppointmentId): Promise<VideoCall | null>;
}
