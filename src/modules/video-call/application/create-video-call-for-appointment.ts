import { ApplicationService } from "@/modules/shared/domain/service.";
import { VideoCall, VideoCallAppointmentId } from "../domain/video-call";
import { VideoCallAlreadyExists } from "../domain/video-call-already-exists";
import { VideoCallRepository } from "../domain/video-call-repository";

@ApplicationService()
export class CreateVideoCallForAppointment {
  constructor(private readonly videoCallRepository: VideoCallRepository) {}

  async execute(appointment_id: string): Promise<void> {
    const appointmentId = new VideoCallAppointmentId(appointment_id);
    const existingVideoCall = await this.videoCallRepository.findByAppointmentId(appointmentId);

    if (existingVideoCall) {
      throw new VideoCallAlreadyExists(appointment_id);
    }

    const videoCall = VideoCall.create(appointment_id);
    await this.videoCallRepository.create(videoCall);
  }
}

